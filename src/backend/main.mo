import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  module State {
    public type State = { /* Add fields as needed */ };
  };
  let state = { /* Initialize additional state data here */ };

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
    // Additional fields can be added later
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
    };

    public func compare(o1 : Order, o2 : Order) : Order.Order {
      Text.compare(o1.id, o2.id);
    };
  };

  public type Order = OrderModule.Order;
  public type OrderStatus = OrderModule.Status;

  // Storage mixin for file uploads
  include MixinStorage();

  // Orders keyed by order ID
  let orders = Map.empty<Text, Order>();
  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the user system state
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

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    };

    orders.add(id, newOrder);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (
          not (
            (AccessControl.hasPermission(accessControlState, caller, #admin)) or isOrderOwner(caller, orderId)
          )
        ) {
          Runtime.trap("Unauthorized: Only admins can update any order, users can update their own orders");
        };
        orders.add(orderId, { order with status });
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    if (
      not (
        AccessControl.hasPermission(accessControlState, caller, #admin) or isOrderOwner(caller, orderId)
      )
    ) {
      Runtime.trap("Unauthorized: Only admins can view all orders, users can view their own orders");
    };
    orders.get(orderId);
  };

  public query ({ caller }) func getOrdersByIds(orderIds : [Text]) : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can fetch multiple orders");
    };

    orderIds.map(
      func(id) {
        switch (orders.get(id)) {
          case (null) { Runtime.trap("Order not found with id " # id) };
          case (?order) { order };
        };
      }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can retrieve all orders");
    };
    orders.values().toArray().sort();
  };
};
