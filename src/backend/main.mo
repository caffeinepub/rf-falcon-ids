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
    // Extend as needed
  };

  // TREY C SECURITY Types
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

  // Mixins for storage and auth
  include MixinStorage();
  var orders = Map.empty<Text, Order>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // TREY C SECURITY State
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

  // TREY C SECURITY: Rate limiting function
  func checkRateLimit(caller : Principal, action : Text) : Bool {
    if (not securityConfig.enabled) {
      return true;
    };

    // Allowlist bypass
    if (allowlist.containsKey(caller)) {
      return true;
    };

    // Blocklist check
    if (blocklist.containsKey(caller)) {
      logSecurityEvent(caller, action, #denied, "Principal is blocklisted");
      securityStats := {
        securityStats with deniedCalls = securityStats.deniedCalls + 1
      };
      return false;
    };

    // Rate limit check
    let now = Time.now();
    let windowStart = now - securityConfig.rateLimitWindow;

    let history = switch (callHistory.get(caller)) {
      case (null) { List.empty<Time.Time>() };
      case (?h) { h };
    };

    // Filter calls within window
    let recentCalls = history.filter(func(t) { t > windowStart });
    let callCount = recentCalls.size();

    if (callCount >= securityConfig.maxCallsPerWindow) {
      logSecurityEvent(caller, action, #throttled, "Rate limit exceeded");
      securityStats := {
        securityStats with throttledCalls = securityStats.throttledCalls + 1
      };
      return false;
    };

    // Update history
    recentCalls.add(now);
    callHistory.add(caller, recentCalls);

    logSecurityEvent(caller, action, #allowed, "Within rate limit");
    securityStats := {
      securityStats with allowedCalls = securityStats.allowedCalls + 1
    };
    return true;
  };

  func logSecurityEvent(principal : Principal, action : Text, result : { #allowed; #denied; #throttled }, reason : Text) {
    let event : SecurityEvent = {
      timestamp = Time.now();
      principal;
      action;
      result;
      reason;
    };
    securityEvents.add(event);

    // Keep only last 1000 events
    if (securityEvents.size() > 1000) {
      let truncatedEvents = List.empty<SecurityEvent>();
      var count = 0;
      for (event in securityEvents.values()) {
        if (count < 1000) {
          truncatedEvents.add(event);
          count += 1;
        };
      };
      securityEvents := truncatedEvents;
    };
  };

  func logAuditEntry(admin : Principal, action : Text, details : Text) {
    let entry : AuditLogEntry = {
      timestamp = Time.now();
      admin;
      action;
      details;
    };
    auditLog.add(entry);

    // Keep only last 500 audit entries
    if (auditLog.size() > 500) {
      let truncatedLog = List.empty<AuditLogEntry>();
      var count = 0;
      for (entry in auditLog.values()) {
        if (count < 500) {
          truncatedLog.add(entry);
          count += 1;
        };
      };
      auditLog := truncatedLog;
    };
  };

  public query func isOrderOwner(caller : Principal, orderId : Text) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) { order.owner == ?caller };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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

    if (not checkRateLimit(caller, "saveCallerUserProfile")) {
      Runtime.trap("TREY C SECURITY: Rate limit exceeded or access denied");
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
    await createOrder(id, details, address, photo);
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found after creation") };
      case (?order) { order };
    };
  };

  // ========== TREY C SECURITY: Observability Endpoints ==========

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
    let size = securityEvents.size();
    let actualLimit = if (limit < size) { limit } else { size };
    let resultIter = securityEvents.values().take(actualLimit);
    let resultLst = List.fromIter<SecurityEvent>(resultIter);
    resultLst.toArray();
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

  // ========== TREY C SECURITY: Administrative Controls ==========

  public shared ({ caller }) func setSecurityEnabled(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure security");
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

    blocklist.add(principal, true);
    logAuditEntry(caller, "addToBlocklist", "Principal " # principal.toText() # " added to blocklist");
  };

  public shared ({ caller }) func removeFromBlocklist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage blocklist");
    };

    blocklist.remove(principal);
    logAuditEntry(caller, "removeFromBlocklist", "Principal " # principal.toText() # " removed from blocklist");
  };

  public shared ({ caller }) func addToAllowlist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage allowlist");
    };

    allowlist.add(principal, true);
    logAuditEntry(caller, "addToAllowlist", "Principal " # principal.toText() # " added to allowlist");
  };

  public shared ({ caller }) func removeFromAllowlist(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage allowlist");
    };

    allowlist.remove(principal);
    logAuditEntry(caller, "removeFromAllowlist", "Principal " # principal.toText() # " removed from allowlist");
  };

  // ========== Advanced Admin Panel Tools ==========

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

    let size = auditLog.size();
    let actualLimit = if (limit < size) { limit } else { size };
    let resultIter = auditLog.values().take(actualLimit);
    let resultLst = List.fromIter<AuditLogEntry>(resultIter);
    resultLst.toArray();
  };
};
