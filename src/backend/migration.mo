import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

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

  type OrderStatus = { #pending; #approved; #shipped; #completed };

  type Order = {
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

  type PromoCode = {
    code : Text;
    discountPercentage : Nat;
    validUntil : Time.Time;
    usageLimit : Nat;
    timesUsed : Nat;
    active : Bool;
  };

  type UserProfile = {
    name : Text;
    email : ?Text;
    isVIP : Bool;
  };

  type SecurityStats = {
    allowedCalls : Nat;
    deniedCalls : Nat;
    throttledCalls : Nat;
  };

  type AuditLogEntry = {
    timestamp : Time.Time;
    admin : Principal;
    action : Text;
    details : Text;
  };

  type OldActor = {
    orders : Map.Map<Text, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    bannedUsers : Set.Set<Principal>;
    activeAccounts : Set.Set<Principal>;
    promoCodes : Map.Map<Text, PromoCode>;
    auditLog : List.List<AuditLogEntry>;
    securityStats : SecurityStats;
    vipUsers : Set.Set<Principal>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    orders : Map.Map<Text, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    bannedUsers : Set.Set<Principal>;
    activeAccounts : Set.Set<Principal>;
    promoCodes : Map.Map<Text, PromoCode>;
    auditLog : List.List<AuditLogEntry>;
    securityStats : SecurityStats;
    vipUsers : Set.Set<Principal>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
