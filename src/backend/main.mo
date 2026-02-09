import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  public type Address = {
    first_name : Text;
    last_name : Text;
    address : Text;
    state : Text;
    city : Text;
    zip : Text;
  };

  public type Details = {
    dob : Text;
    address : Text;
    state_name : Text;
    city : Text;
    zip : Text;
    id_number : Text;
    first_name : Text;
    last_name : Text;
    gender : Text;
    height : Text;
    eye_color : Text;
  };

  public type OrderStatus = { #pending; #approved; #shipped; #completed };

  public type Order = {
    id : Text;
    details : Details;
    address : Address;
    photo : Storage.ExternalBlob;
    creationTime : Time.Time;
    status : OrderStatus;
    owner : ?Principal;
    trackingNumber : ?Text;
    promoUsed : Bool;
    promoCode : ?Text;
    signature : ?Storage.ExternalBlob;
    archived : Bool;
  };

  public type PromoCode = {
    code : Text;
    discountPercentage : Nat;
    validUntil : Time.Time;
    usageLimit : Nat;
    timesUsed : Nat;
    active : Bool;
  };

  public type PromoCodeValidation = {
    valid : Bool;
    discountPercentage : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    isVIP : Bool;
  };

  public type SecurityEvent = {
    timestamp : Time.Time;
    principal : Principal;
    action : Text;
    result : { #allowed; #denied; #throttled };
    reason : Text;
  };

  public type SecurityConfig = {
    enabled : Bool;
    rateLimitWindow : Nat;
    maxCallsPerWindow : Nat;
  };

  public type SecurityStats = {
    allowedCalls : Nat;
    deniedCalls : Nat;
    throttledCalls : Nat;
  };

  public type AuditLogEntry = {
    timestamp : Time.Time;
    admin : Principal;
    action : Text;
    details : Text;
  };

  public type AccountInfo = {
    principal : Principal;
    profile : ?UserProfile;
    isBanned : Bool;
    isVIP : Bool;
    orderCount : Nat;
  };

  public type AdminDashboardData = {
    orders : [Order];
    accounts : [AccountInfo];
    securityStats : SecurityStats;
    auditLog : [AuditLogEntry];
  };

  include MixinStorage();

  var orders = Map.empty<Text, Order>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  let bannedUsers = Set.empty<Principal>();
  let activeAccounts = Set.empty<Principal>();
  var promoCodes = Map.empty<Text, PromoCode>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var auditLog = List.empty<AuditLogEntry>();
  var securityStats : SecurityStats = {
    allowedCalls = 0;
    deniedCalls = 0;
    throttledCalls = 0;
  };

  let vipUsers = Set.empty<Principal>();

  func logAudit(admin : Principal, action : Text, details : Text) {
    let entry : AuditLogEntry = {
      timestamp = Time.now();
      admin;
      action;
      details;
    };
    auditLog.add(entry);
  };

  func countOrdersForPrincipal(principal : Principal) : Nat {
    var count = 0;
    for ((_, order) in orders.entries()) {
      switch (order.owner) {
        case (?owner) {
          if (owner == principal) {
            count += 1;
          };
        };
        case (null) {};
      };
    };
    count;
  };

  // Promo Code Management (Admin Only)
  public shared ({ caller }) func createPromoCode(
    code : Text,
    discountPercentage : Nat,
    validUntil : Time.Time,
    usageLimit : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create promo codes");
    };

    let promo : PromoCode = {
      code;
      discountPercentage;
      validUntil;
      usageLimit;
      timesUsed = 0;
      active = true;
    };

    promoCodes.add(code, promo);
    logAudit(caller, "create_promo_code", "Code: " # code);
  };

  public shared ({ caller }) func deactivatePromoCode(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can deactivate promo codes");
    };

    switch (promoCodes.get(code)) {
      case (?promo) {
        let updatedPromo = {
          promo with active = false;
        };
        promoCodes.add(code, updatedPromo);
        logAudit(caller, "deactivate_promo_code", "Code: " # code);
      };
      case (null) {
        Runtime.trap("Promo code not found");
      };
    };
  };

  // Admin-only: Get all promo codes
  public query ({ caller }) func getAllPromoCodes() : async [PromoCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all promo codes");
    };

    let promoList = List.empty<PromoCode>();
    for ((_, promo) in promoCodes.entries()) {
      promoList.add(promo);
    };
    promoList.toArray();
  };

  // Admin-only: Get specific promo code details
  public query ({ caller }) func getPromoCode(code : Text) : async ?PromoCode {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view promo code details");
    };

    promoCodes.get(code);
  };

  // Public: Validate promo code (returns only validity and discount, not usage details)
  public query func validatePromoCode(code : Text) : async PromoCodeValidation {
    switch (promoCodes.get(code)) {
      case (?promo) {
        let currentTime = Time.now();
        let isValid = promo.active and currentTime <= promo.validUntil and promo.timesUsed < promo.usageLimit;
        {
          valid = isValid;
          discountPercentage = if (isValid) { promo.discountPercentage } else { 0 };
        };
      };
      case (null) {
        {
          valid = false;
          discountPercentage = 0;
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrder(
    id : Text,
    details : Details,
    address : Address,
    photo : Storage.ExternalBlob,
    promoCode : ?Text,
    signature : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot create orders");
    };

    let isVIP = vipUsers.contains(caller);

    var promoUsed = isVIP;
    var validatedPromoCode = null;

    switch (promoCode) {
      case (?code) {
        switch (promoCodes.get(code)) {
          case (?promo) {
            let currentTime = Time.now();
            if (promo.active and currentTime <= promo.validUntil and promo.timesUsed < promo.usageLimit) {
              promoUsed := true;

              let updatedPromo = {
                promo with timesUsed = promo.timesUsed + 1;
              };
              promoCodes.add(code, updatedPromo);
            };
          };
          case (null) {};
        };
      };
      case (null) {};
    };

    let order : Order = {
      id;
      details;
      address;
      photo;
      creationTime = Time.now();
      status = #pending;
      owner = ?caller;
      trackingNumber = null;
      promoUsed;
      promoCode = validatedPromoCode;
      signature;
      archived = false;
    };

    orders.add(id, order);
    activeAccounts.add(caller);
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    let order = orders.get(orderId);
    switch (order) {
      case (?o) {
        switch (o.owner) {
          case (?owner) {
            if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own orders");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own orders");
            };
          };
        };
        order;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access orders");
    };

    let userOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      switch (order.owner) {
        case (?owner) {
          if (owner == caller) {
            userOrders.add(order);
          };
        };
        case (null) {};
      };
    };
    userOrders.toArray();
  };

  // Admin-only: Get all non-archived orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };

    let allOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (not order.archived) {
        allOrders.add(order);
      };
    };
    allOrders.toArray();
  };

  // Admin-only: Update order status
  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          order with status = status;
        };
        orders.add(orderId, updatedOrder);
        logAudit(caller, "update_order_status", "Order: " # orderId # ", Status: " # debug_show(status));
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  // Admin-only: Add/Edit order details
  public shared ({ caller }) func updateOrderDetails(
    orderId : Text,
    newDetails : Details,
    newAddress : Address,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order details");
    };

    switch (orders.get(orderId)) {
      case (?existingOrder) {
        let updatedOrder = {
          existingOrder with
          details = newDetails;
          address = newAddress;
        };
        orders.add(orderId, updatedOrder);
        logAudit(
          caller,
          "edit_order_details",
          "Order: " # orderId # ", New details: " # debug_show(newDetails) # ", New address: " # debug_show(newAddress),
        );
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  // Admin-only: Set tracking number
  public shared ({ caller }) func setTrackingNumber(orderId : Text, trackingNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set tracking numbers");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          order with trackingNumber = ?trackingNumber;
        };
        orders.add(orderId, updatedOrder);
        logAudit(caller, "set_tracking_number", "Order: " # orderId # ", Tracking: " # trackingNumber);
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  // Admin-only: Set VIP status
  public shared ({ caller }) func setVIPStatus(user : Principal, isVIP : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set VIP status");
    };

    if (isVIP) {
      vipUsers.add(user);
    } else {
      vipUsers.remove(user);
    };

    logAudit(
      caller,
      "set_vip_status",
      "User: " # user.toText() # ", VIP: " # debug_show(isVIP),
    );
  };

  // Admin-only: Ban user
  public shared ({ caller }) func banUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    bannedUsers.add(user);
    logAudit(caller, "ban_user", "User: " # user.toText());
  };

  // Admin-only: Unban user
  public shared ({ caller }) func unbanUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };

    bannedUsers.remove(user);
    logAudit(caller, "unban_user", "User: " # user.toText());
  };

  // Admin-only: Get dashboard data
  public query ({ caller }) func getAdminDashboard() : async AdminDashboardData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access dashboard");
    };

    let allOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (not order.archived) {
        allOrders.add(order);
      };
    };

    let accountsList = List.empty<AccountInfo>();
    for (principal in activeAccounts.values()) {
      let orderCount = countOrdersForPrincipal(principal);
      if (orderCount > 0) {
        let profile = userProfiles.get(principal);
        let isBanned = bannedUsers.contains(principal);
        let isVIP = vipUsers.contains(principal);

        let accountInfo : AccountInfo = {
          principal;
          profile;
          isBanned;
          isVIP;
          orderCount;
        };
        accountsList.add(accountInfo);
      };
    };

    {
      orders = allOrders.toArray();
      accounts = accountsList.toArray();
      securityStats;
      auditLog = auditLog.toArray();
    };
  };

  // Admin-only: Get audit log
  public query ({ caller }) func getAuditLog() : async [AuditLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access audit log");
    };

    auditLog.toArray();
  };

  // Admin-only: Get account info for a specific user (enhanced for admin UI)
  public query ({ caller }) func getAccountInfo(user : Principal) : async ?AccountInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access account information");
    };

    let orderCount = countOrdersForPrincipal(user);

    if (orderCount > 0) {
      let profile = userProfiles.get(user);
      let isBanned = bannedUsers.contains(user);
      let isVIP = vipUsers.contains(user);

      ?{
        principal = user;
        profile;
        isBanned;
        isVIP;
        orderCount;
      };
    } else {
      null;
    };
  };

  // Authenticated: Check if user is banned (self or admin only)
  public query ({ caller }) func isUserBanned(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own ban status");
    };
    bannedUsers.contains(user);
  };

  // Authenticated: Check caller's own VIP status
  public query ({ caller }) func isCallerVIP() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check VIP status");
    };
    vipUsers.contains(caller);
  };

  // Authenticated: Check VIP status (self or admin)
  public query ({ caller }) func isUserVIP(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own VIP status");
    };
    vipUsers.contains(user);
  };

  // Admin-only: Delete order
  public shared ({ caller }) func deleteOrder(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };

    switch (orders.get(orderId)) {
      case (?_order) {
        orders.remove(orderId);
        logAudit(caller, "delete_order", "Order: " # orderId);
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  // Admin-only: Archive order
  public shared ({ caller }) func archiveOrder(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can archive orders");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          order with archived = true : Bool;
        };
        orders.add(orderId, updatedOrder);
        logAudit(caller, "archive_order", "Order: " # orderId);
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  // Admin-only: Get archived orders
  public query ({ caller }) func getArchivedOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access archived orders");
    };

    let archivedOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.archived) {
        archivedOrders.add(order);
      };
    };
    archivedOrders.toArray();
  };
};

