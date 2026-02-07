import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

import Migration "migration";

// Data migration on upgrade
(with migration = Migration.run)
actor {
  // State module to encapsulate persistent state structure
  module State {
    public type State = { /* Extend as needed */ };
  };

  // Persistent state instance
  var state = { /* Initialize state as needed */ };

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

  public type UserProfile = {
    name : Text;
    // Extend as needed
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

  // Storage mixin for file uploads - MUST be kept first
  include MixinStorage();

  // Orders storage
  var orders = Map.empty<Text, Order>();
  // User profiles storage
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Persistent AccessControl state instance
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func isOrderOwner(caller : Principal, orderId : Text) : Bool {
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
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrder(
    id : Text,
    details : Details,
    address : Address,
    photo : Storage.ExternalBlob,
  ) : async () {
    if (orders.containsKey(id)) {
      Runtime.trap("Order ID already exists");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
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

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, { order with status });
      };
    };
  };

  public shared ({ caller }) func setTrackingNumber(orderId : Text, trackingNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set tracking numbers");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.status == #pending) {
          Runtime.trap("Cannot set tracking number for pending orders");
        };
        let updatedOrder = { order with trackingNumber = ?trackingNumber };
        orders.add(orderId, updatedOrder);
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

  public shared ({ caller }) func deleteOrder(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };

    if (not orders.containsKey(orderId)) {
      Runtime.trap("Order not found");
    };

    orders.remove(orderId);
  };

  public shared ({ caller }) func resetAllData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset data");
    };

    orders.clear();
  };
};
