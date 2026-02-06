import Map "mo:core/Map";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

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

  type Status = { #pending; #approved; #shipped };

  type OldOrder = {
    id : Text;
    details : Details;
    address : Address;
    photo : Storage.ExternalBlob;
    creationTime : Int;
    status : Status;
    owner : ?Principal;
  };

  type NewOrder = {
    id : Text;
    details : Details;
    address : Address;
    photo : Storage.ExternalBlob;
    creationTime : Int;
    status : Status;
    owner : ?Principal;
    trackingNumber : ?Text;
  };

  type OldActor = {
    orders : Map.Map<Text, OldOrder>;
  };

  type NewActor = {
    orders : Map.Map<Text, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Text, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        { oldOrder with trackingNumber = null };
      }
    );
    { orders = newOrders };
  };
};
