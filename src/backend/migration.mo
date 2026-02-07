import Map "mo:core/Map";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

module {
  type OldState = { /* Extend as needed */ };
  type NewState = { /* Extend as needed */ };

  type OldOrder = {
    id : Text;
    details : {
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
    address : {
      first_name : Text;
      last_name : Text;
      address : Text;
      state : Text;
      city : Text;
      zip : Text;
    };
    photo : Storage.ExternalBlob;
    creationTime : Int;
    status : { #pending; #approved; #shipped };
    owner : ?Principal;
    trackingNumber : ?Text;
  };

  type OldActor = {
    state : OldState;
    orders : Map.Map<Text, OldOrder>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewOrder = OldOrder; // No changes in the Order structure

  type NewActor = {
    state : NewState;
    orders : Map.Map<Text, NewOrder>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    { old with state = { /* Initialize new state as needed */ } };
  };
};
