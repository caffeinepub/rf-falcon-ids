import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
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
      owner : Principal;
      details : Details;
      address : Address;
      photo : Storage.ExternalBlob;
      creationTime : Time.Time;
      status : Status;
    };

    public func compare(o1 : Order, o2 : Order) : Order.Order {
      Text.compare(o1.id, o2.id);
    };
  };

  public type Order = OrderModule.Order;
  public type OrderStatus = OrderModule.Status;

  // Storage mixin for file uploads
  include MixinStorage();

  module State {
    // Add additional state data here
    public type State = { /* Add fields as needed */ };
  };
  let state = {
    // Initialize additional state data here
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Orders keyed by order ID
  let orders = Map.empty<Text, Order>();
  // User orders mapping: Principal -> List of order IDs
  let userOrders = Map.empty<Principal, List.List<Text>>();

  public shared ({ caller }) func createOrder(
    id : Text,
    details : Details,
    address : Address,
    photo : Storage.ExternalBlob,
  ) : async Order {
    // Only authenticated users can create orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    // Check if order ID already exists
    switch (orders.get(id)) {
      case (?_) { Runtime.trap("Order ID already exists") };
      case (null) {};
    };

    let newOrder : Order = {
      id;
      owner = caller;
      details;
      address;
      photo;
      creationTime = Time.now();
      status = #pending;
    };

    orders.add(id, newOrder);

    // Add order ID to user's order list
    let currentUserOrders = switch (userOrders.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?list) { list };
    };
    currentUserOrders.add(id);
    userOrders.add(caller, currentUserOrders);

    newOrder;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    // Only admins can update order status
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

  public query ({ caller }) func getOrder(orderId : Text) : async Order {
    // Users must be authenticated
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Users can only view their own orders, admins can view any order
        if (order.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    // Only authenticated users can view their orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    // Find orders for this user
    let filteredOrders = orders.values().toArray().filter(
      func(o) {
        o.owner == caller;
      }
    );

    filteredOrders.sort();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    // Only admins can view all orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray().sort();
  };
};
