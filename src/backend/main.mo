import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

// Specify the data migration function in with-clause

actor {
  module State {
    public type State = { /* Persistent state goes here */ };
  };
  var state = { /* Initialize persistent state */ };

  type Address = {
    first_name : Text;
    last_name : Text;
    address : Text;
    state : Text;
    city : Text;
    zip : Text;
  };

  type Details = {
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
    };

    public func compare(o1 : Order, o2 : Order) : Order.Order {
      Text.compare(o1.id, o2.id);
    };
  };
  public type Order = OrderModule.Order;
  public type OrderStatus = OrderModule.Status;

  public type UserProfile = {
    name : Text;
    email : ?Text;
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
    rateLimitWindow : Nat; // nanoseconds
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

  public type AdminDashboardData = {
    orders : [Order];
    userProfiles : [(Principal, UserProfile)];
    securityStats : SecurityStats;
    auditLog : [AuditLogEntry];
  };

  include MixinStorage();

  // Persistent state
  var orders = Map.empty<Text, Order>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var securityConfig : SecurityConfig = {
    enabled = true;
    rateLimitWindow = 60_000_000_000; // 60 seconds in nanoseconds
    maxCallsPerWindow = 100;
  };

  var callHistory = Map.empty<Principal, List.List<Time.Time>>();
  var blocklist = Map.empty<Principal, Bool>();
  var allowlist = Map.empty<Principal, Bool>();
  var securityEvents = List.empty<SecurityEvent>();
  var securityStats : SecurityStats = {
    allowedCalls = 0;
    deniedCalls = 0;
    throttledCalls = 0;
  };
  var auditLog = List.empty<AuditLogEntry>();

  // Admin management state
  var adminEmails = Map.empty<Text, Bool>();
  var emailToPrincipal = Map.empty<Text, Principal>();
  let OWNER_EMAIL = "traviscastonguay@gmail.com";
  var ownerPrincipal : ?Principal = null;

  // Optimized rate limiting with reduced overhead
  func checkRateLimit(caller : Principal, action : Text) : Bool {
    if (not securityConfig.enabled) {
      return true;
    };

    // Fast path: allowlist bypass
    if (allowlist.containsKey(caller)) {
      securityStats := {
        securityStats with allowedCalls = securityStats.allowedCalls + 1
      };
      logSecurityEvent(caller, action, #allowed, "Allowlisted principal");
      return true;
    };

    // Fast path: blocklist deny
    if (blocklist.containsKey(caller)) {
      securityStats := {
        securityStats with deniedCalls = securityStats.deniedCalls + 1
      };
      logSecurityEvent(caller, action, #denied, "Principal is blocklisted");
      return false;
    };

    let now = Time.now();
    let windowStart = now - securityConfig.rateLimitWindow;

    // Get existing history or empty list
    let history = switch (callHistory.get(caller)) {
      case (null) { List.empty<Time.Time>() };
      case (?h) { h };
    };

    // Filter to recent calls only (optimized: single pass)
    var recentCalls = List.empty<Time.Time>();
    var callCount = 0;
    for (timestamp in history.values()) {
      if (timestamp > windowStart) {
        recentCalls.add(timestamp);
        callCount += 1;
      };
    };

    // Check rate limit
    if (callCount >= securityConfig.maxCallsPerWindow) {
      securityStats := {
        securityStats with throttledCalls = securityStats.throttledCalls + 1
      };
      logSecurityEvent(caller, action, #throttled, "Rate limit exceeded");
      return false;
    };

    // Add current timestamp and update history
    recentCalls.add(now);
    callHistory.add(caller, recentCalls);

    securityStats := {
      securityStats with allowedCalls = securityStats.allowedCalls + 1
    };
    logSecurityEvent(caller, action, #allowed, "Within rate limit");
    return true;
  };

  // Optimized security event logging with proper retention (keep most recent)
  func logSecurityEvent(principal : Principal, action : Text, result : { #allowed; #denied; #throttled }, reason : Text) {
    let event : SecurityEvent = {
      timestamp = Time.now();
      principal;
      action;
      result;
      reason;
    };
    securityEvents.add(event);

    // Truncate to keep most recent 1000 events
    let size = securityEvents.size();
    if (size > 1000) {
      let eventsArray = securityEvents.toArray();
      let startIndex = size - 1000;
      let recentEvents = Array.tabulate(1000, func(i) {
        eventsArray[startIndex + i];
      });
      securityEvents := List.fromArray(recentEvents);
    };
  };

  // Optimized audit log with proper retention (keep most recent)
  func logAuditEntry(admin : Principal, action : Text, details : Text) {
    let entry : AuditLogEntry = {
      timestamp = Time.now();
      admin;
      action;
      details;
    };
    auditLog.add(entry);

    // Truncate to keep most recent 500 entries
    let size = auditLog.size();
    if (size > 500) {
      let logArray = auditLog.toArray();
      let startIndex = size - 500;
      let recentLog = Array.tabulate(500, func(i) {
        logArray[startIndex + i];
      });
      auditLog := List.fromArray(recentLog);
    };
  };

  func isOwner(caller : Principal) : Bool {
    switch (ownerPrincipal) {
      case (null) { false };
      case (?owner) { caller == owner };
    };
  };

  func isAdminByPrincipal(caller : Principal) : Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return false;
    };

    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.email) {
          case (null) { false };
          case (?email) { adminEmails.containsKey(email) };
        };
      };
    };
  };

  public query ({ caller }) func isOrderOwner(orderId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check order ownership");
    };

    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) { order.owner == ?caller };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (not checkRateLimit(caller, "saveCallerUserProfile")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    switch (profile.email) {
      case (?email) {
        emailToPrincipal.add(email, caller);

        if (email == OWNER_EMAIL and ownerPrincipal == null) {
          ownerPrincipal := ?caller;
          adminEmails.add(email, true);
          logAuditEntry(caller, "ownerInitialized", "Owner principal set for " # OWNER_EMAIL);
        };
      };
      case (null) { };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrder(
    id : Text,
    details : Details,
    address : Address,
    photo : Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    if (not checkRateLimit(caller, "createOrder")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    if (orders.containsKey(id)) {
      Runtime.trap("Order ID already exists");
    };

    let newOrder : Order = {
      id;
      details;
      address;
      photo;
      creationTime = Time.now();
      status = #pending;
      owner = ?caller;
      trackingNumber = null;
    };

    orders.add(id, newOrder);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    if (not checkRateLimit(caller, "updateOrderStatus")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, { order with status });
        logAuditEntry(caller, "updateOrderStatus", "Order " # orderId # " status updated");
      };
    };
  };

  public shared ({ caller }) func setTrackingNumber(orderId : Text, trackingNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set tracking numbers");
    };

    if (not checkRateLimit(caller, "setTrackingNumber")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.status == #pending) {
          Runtime.trap("Cannot set tracking number for pending orders");
        };
        let updatedOrder = { order with trackingNumber = ?trackingNumber };
        orders.add(orderId, updatedOrder);
        logAuditEntry(caller, "setTrackingNumber", "Tracking number set for order " # orderId);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (AccessControl.isAdmin(accessControlState, caller) or order.owner == ?caller) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: You can only view your own orders");
        };
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can retrieve all orders");
    };
    orders.values().toArray().sort();
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can retrieve orders by status");
    };

    let resultList = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.status == status) {
        resultList.add(order);
      };
    };
    resultList.values().toArray();
  };

  public shared ({ caller }) func deleteOrder(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };

    if (not checkRateLimit(caller, "deleteOrder")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    if (not orders.containsKey(orderId)) {
      Runtime.trap("Order not found");
    };

    orders.remove(orderId);
    logAuditEntry(caller, "deleteOrder", "Order " # orderId # " deleted");
  };

  public shared ({ caller }) func resetAllData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset data");
    };

    if (not checkRateLimit(caller, "resetAllData")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    orders.clear();
    logAuditEntry(caller, "resetAllData", "All order data reset");
  };

  public shared ({ caller }) func createOrderWithCallback(id : Text, details : Details, address : Address, photo : Storage.ExternalBlob) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    if (not checkRateLimit(caller, "createOrderWithCallback")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    if (orders.containsKey(id)) {
      Runtime.trap("Order ID already exists");
    };

    let newOrder : Order = {
      id;
      details;
      address;
      photo;
      creationTime = Time.now();
      status = #pending;
      owner = ?caller;
      trackingNumber = null;
    };

    orders.add(id, newOrder);
    newOrder;
  };

  public query ({ caller }) func getSecurityStats() : async SecurityStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view security stats");
    };
    securityStats;
  };

  public query ({ caller }) func getSecurityEvents(limit : Nat) : async [SecurityEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view security events");
    };
    
    let eventsArray = securityEvents.toArray();
    let size = eventsArray.size();
    let actualLimit = if (limit < size) { limit } else { size };
    
    // Return most recent events (from the end of the array)
    let startIndex = if (size > actualLimit) { size - actualLimit } else { 0 };
    Array.tabulate<SecurityEvent>(actualLimit, func(i) {
      eventsArray[startIndex + i];
    });
  };

  public query ({ caller }) func getSecurityConfig() : async {
    enabled : Bool;
    rateLimitWindow : Nat;
    maxCallsPerWindow : Nat;
    blocklistSize : Nat;
    allowlistSize : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view security config");
    };
    {
      enabled = securityConfig.enabled;
      rateLimitWindow = securityConfig.rateLimitWindow;
      maxCallsPerWindow = securityConfig.maxCallsPerWindow;
      blocklistSize = blocklist.size();
      allowlistSize = allowlist.size();
    };
  };

  public shared ({ caller }) func setSecurityEnabled(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure security");
    };

    if (not checkRateLimit(caller, "setSecurityEnabled")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    securityConfig := { securityConfig with enabled };
    logAuditEntry(caller, "setSecurityEnabled", "Security " # (if (enabled) { "enabled" } else {
      "disabled";
    }));
  };

  public shared ({ caller }) func updateRateLimits(rateLimitWindow : Nat, maxCallsPerWindow : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure security");
    };

    if (not checkRateLimit(caller, "updateRateLimits")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    securityConfig := {
      enabled = securityConfig.enabled;
      rateLimitWindow;
      maxCallsPerWindow;
    };
    logAuditEntry(caller, "updateRateLimits", "Rate limits updated: window=" # rateLimitWindow.toText() # ", max=" # maxCallsPerWindow.toText());
  };

  public shared ({ caller }) func clearSecurityCounters() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear security counters");
    };

    if (not checkRateLimit(caller, "clearSecurityCounters")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    securityStats := {
      allowedCalls = 0;
      deniedCalls = 0;
      throttledCalls = 0;
    };
    securityEvents.clear();
    logAuditEntry(caller, "clearSecurityCounters", "Security counters and events cleared");
  };

  public shared ({ caller }) func addToBlocklist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage blocklist");
    };

    if (not checkRateLimit(caller, "addToBlocklist")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    blocklist.add(principal, true);
    logAuditEntry(caller, "addToBlocklist", "Principal " # principal.toText() # " added to blocklist");
  };

  public shared ({ caller }) func removeFromBlocklist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage blocklist");
    };

    if (not checkRateLimit(caller, "removeFromBlocklist")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    blocklist.remove(principal);
    logAuditEntry(caller, "removeFromBlocklist", "Principal " # principal.toText() # " removed from blocklist");
  };

  public shared ({ caller }) func addToAllowlist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage allowlist");
    };

    if (not checkRateLimit(caller, "addToAllowlist")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    allowlist.add(principal, true);
    logAuditEntry(caller, "addToAllowlist", "Principal " # principal.toText() # " added to allowlist");
  };

  public shared ({ caller }) func removeFromAllowlist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage allowlist");
    };

    if (not checkRateLimit(caller, "removeFromAllowlist")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    allowlist.remove(principal);
    logAuditEntry(caller, "removeFromAllowlist", "Principal " # principal.toText() # " removed from allowlist");
  };

  public shared ({ caller }) func bulkApproveOrders(orderIds : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform bulk actions");
    };

    if (not checkRateLimit(caller, "bulkApproveOrders")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    for (orderId in orderIds.vals()) {
      switch (orders.get(orderId)) {
        case (null) { /* Skip missing orders */ };
        case (?order) {
          orders.add(orderId, { order with status = #approved });
        };
      };
    };
    logAuditEntry(caller, "bulkApproveOrders", orderIds.size().toText() # " orders approved");
  };

  public shared ({ caller }) func bulkShipOrders(orderIds : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform bulk actions");
    };

    if (not checkRateLimit(caller, "bulkShipOrders")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    for (orderId in orderIds.vals()) {
      switch (orders.get(orderId)) {
        case (null) { /* Skip missing orders */ };
        case (?order) {
          orders.add(orderId, { order with status = #shipped });
        };
      };
    };
    logAuditEntry(caller, "bulkShipOrders", orderIds.size().toText() # " orders shipped");
  };

  public shared ({ caller }) func bulkDeleteOrders(orderIds : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform bulk actions");
    };

    if (not checkRateLimit(caller, "bulkDeleteOrders")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    for (orderId in orderIds.vals()) {
      orders.remove(orderId);
    };
    logAuditEntry(caller, "bulkDeleteOrders", orderIds.size().toText() # " orders deleted");
  };

  public query ({ caller }) func exportOrdersCSV() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can export data");
    };

    var csv = "Order ID,First Name,Last Name,Status,Creation Time,Tracking Number,Owner\n";

    for ((_, order) in orders.entries()) {
      let statusText = switch (order.status) {
        case (#pending) { "pending" };
        case (#approved) { "approved" };
        case (#shipped) { "shipped" };
      };
      let trackingText = switch (order.trackingNumber) {
        case (null) { "" };
        case (?tn) { tn };
      };
      let ownerText = switch (order.owner) {
        case (null) { "" };
        case (?p) { p.toText() };
      };

      csv #= order.id # "," # order.details.first_name # "," # order.details.last_name # "," # statusText # "," # order.creationTime.toText() # "," # trackingText # "," # ownerText # "\n";
    };

    csv;
  };

  public query ({ caller }) func getAuditLog(limit : Nat) : async [AuditLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view audit log");
    };

    let logArray = auditLog.toArray();
    let size = logArray.size();
    let actualLimit = if (limit < size) { limit } else { size };
    
    // Return most recent entries (from the end of the array)
    let startIndex = if (size > actualLimit) { size - actualLimit } else { 0 };
    Array.tabulate<AuditLogEntry>(actualLimit, func(i) {
      logArray[startIndex + i];
    });
  };

  public shared ({ caller }) func grantAdminAccess(admin_email : Text) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only the owner (traviscastonguay@gmail.com) can grant admin access");
    };

    if (not checkRateLimit(caller, "grantAdminAccess")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    adminEmails.add(admin_email, true);

    switch (emailToPrincipal.get(admin_email)) {
      case (?principal) {
        AccessControl.assignRole(accessControlState, caller, principal, #admin);
      };
      case (null) { /* Email not yet associated with a principal */ };
    };

    logAuditEntry(caller, "grantAdminAccess", "Admin access granted to " # admin_email);
  };

  public shared ({ caller }) func revokeAdminAccess(admin_email : Text) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only the owner (traviscastonguay@gmail.com) can revoke admin access");
    };

    if (admin_email == OWNER_EMAIL) {
      Runtime.trap("Cannot revoke owner's admin access");
    };

    if (not checkRateLimit(caller, "revokeAdminAccess")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
    };

    adminEmails.remove(admin_email);

    switch (emailToPrincipal.get(admin_email)) {
      case (?principal) {
        AccessControl.assignRole(accessControlState, caller, principal, #user);
      };
      case (null) { /* Email not yet associated with a principal */ };
    };

    logAuditEntry(caller, "revokeAdminAccess", "Admin access revoked for " # admin_email);
  };

  public query ({ caller }) func listAdminEmails() : async [Text] {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only the owner can list admin emails");
    };

    let emailList = List.empty<Text>();
    for ((email, _) in adminEmails.entries()) {
      emailList.add(email);
    };
    emailList.toArray();
  };

  public query ({ caller }) func isAdminEmail(email : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check admin status");
    };
    adminEmails.containsKey(email);
  };

  public query ({ caller }) func getAdminDashboard() : async AdminDashboardData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access dashboard");
    };

    let ordersArray = orders.values().toArray();
    let userProfilesArray = userProfiles.toArray();
    let auditLogArray = auditLog.toArray();

    {
      orders = ordersArray;
      userProfiles = userProfilesArray;
      securityStats;
      auditLog = auditLogArray;
    };
  };
};
