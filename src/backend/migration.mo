import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
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

  type UserProfile = {
    name : Text;
  };

  type OldOrder = {
    id : Text;
    details : Details;
    address : Address;
    photo : Storage.ExternalBlob;
    creationTime : Time.Time;
    status : { #pending; #approved; #shipped };
    owner : Principal;
  };

  type Order = {
    id : Text;
    details : Details;
    address : Address;
    photo : Storage.ExternalBlob;
    creationTime : Time.Time;
    status : { #pending; #approved; #shipped };
    owner : ?Principal;
  };

  type OldActor = {
    orders : Map.Map<Text, OldOrder>;
    userOrders : Map.Map<Principal, List.List<Text>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    // Add other old state variables as needed
  };

  type NewActor = {
    orders : Map.Map<Text, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    // Add other new state variables as needed
  };

  public func run(old : OldActor) : NewActor {
    // Convert orders map from old type to new type
    let newOrders = old.orders.map<Text, OldOrder, Order>(
      func(_id, oldOrder) {
        { oldOrder with owner = ?oldOrder.owner };
      }
    );

    // Create and return new actor state
    {
      orders = newOrders;
      userProfiles = old.userProfiles;
      // Add other new state variables as needed
    };
  };
};
