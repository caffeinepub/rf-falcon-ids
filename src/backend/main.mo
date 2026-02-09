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
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
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

  module OrderModule {
    public type Status = { #pending; #approved; #shipped };
    public type Order = {
      id : Text;
      details : Details;
      address : Address;
      photo : Storage.ExternalBlob;
      creationTime : Time.Time;
      status : Status;
      owner : ?Principal;
      trackingNumber : ?Text;
      promoUsed : Bool;
      promoCode : ?Text;
    };
  };
  public type Order = OrderModule.Order;
  public type OrderStatus = OrderModule.Status;

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
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var auditLog = List.empty<AuditLogEntry>();
  var securityStats : SecurityStats = {
    allowedCalls = 0;
    deniedCalls = 0;
    throttledCalls = 0;
  };

  let vipUsers = Set.empty<Principal>(); // Track VIP users

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

  // User Profile Management - User-level authorization
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

  // Order Management - User-level authorization for creation, admin for modifications
  public shared ({ caller }) func createOrder(
    id : Text,
    details : Details,
    address : Address,
    photo : Storage.ExternalBlob,
    promoCode : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot create orders");
    };

    // Check if user is VIP for discount application
    let isVIP = vipUsers.contains(caller);

    let order : Order = {
      id;
      details;
      address;
      photo;
      creationTime = Time.now();
      status = #pending;
      owner = ?caller;
      trackingNumber = null;
      promoUsed = isVIP; // VIP discount applied at order creation time
      promoCode;
    };

    orders.add(id, order);
    activeAccounts.add(caller);
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    let order = orders.get(orderId);
    switch (order) {
      case (?o) {
        // Users can view their own orders, admins can view all
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

  // Admin-only: Get all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };

    let allOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      allOrders.add(order);
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
      vipUsers.add(user); // Add to VIP set
    } else {
      vipUsers.remove(user); // Remove from VIP set
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
      allOrders.add(order);
    };

    let accountsList = List.empty<AccountInfo>();
    for (principal in activeAccounts.values()) {
      let orderCount = countOrdersForPrincipal(principal);

      // Only include accounts with at least one order
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

  // Public: Check if user is banned (no auth required for transparency)
  public query func isUserBanned(user : Principal) : async Bool {
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
};
