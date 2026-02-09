import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Address {
    zip: string;
    city: string;
    state: string;
    address: string;
    first_name: string;
    last_name: string;
}
export type Time = bigint;
export interface PromoCode {
    active: boolean;
    code: string;
    usageLimit: bigint;
    timesUsed: bigint;
    discountPercentage: bigint;
    validUntil: Time;
}
export interface OwnerBootstrapStatus {
    status: Variant_boostrap_succeeded_already_admin;
    adminSaved: boolean;
}
export interface AuditLogEntry {
    action: string;
    admin: Principal;
    timestamp: Time;
    details: string;
}
export interface Order {
    id: string;
    status: OrderStatus;
    trackingNumber?: string;
    signature?: ExternalBlob;
    owner?: Principal;
    promoCode?: string;
    promoUsed: boolean;
    creationTime: Time;
    address: Address;
    details: Details;
    photo: ExternalBlob;
    archived: boolean;
}
export interface AccountInfo {
    principal: Principal;
    orderCount: bigint;
    isBanned: boolean;
    isVIP: boolean;
    profile?: UserProfile;
}
export interface AdminDashboardData {
    orders: Array<Order>;
    auditLog: Array<AuditLogEntry>;
    accounts: Array<AccountInfo>;
    securityStats: SecurityStats;
}
export interface PromoCodeValidation {
    valid: boolean;
    discountPercentage: bigint;
}
export interface Details {
    dob: string;
    zip: string;
    height: string;
    city: string;
    address: string;
    gender: string;
    first_name: string;
    last_name: string;
    state_name: string;
    id_number: string;
    eye_color: string;
}
export interface SecurityStats {
    deniedCalls: bigint;
    allowedCalls: bigint;
    throttledCalls: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    isVIP: boolean;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    completed = "completed",
    approved = "approved"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_boostrap_succeeded_already_admin {
    boostrap_succeeded = "boostrap_succeeded",
    already_admin = "already_admin"
}
export interface backendInterface {
    archiveOrder(orderId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    banUser(user: Principal): Promise<void>;
    bootstrapOwner(): Promise<OwnerBootstrapStatus>;
    createOrder(id: string, details: Details, address: Address, photo: ExternalBlob, promoCode: string | null, signature: ExternalBlob | null): Promise<void>;
    createPromoCode(code: string, discountPercentage: bigint, validUntil: Time, usageLimit: bigint): Promise<void>;
    deactivatePromoCode(code: string): Promise<void>;
    deleteOrder(orderId: string): Promise<void>;
    getAccountInfo(user: Principal): Promise<AccountInfo | null>;
    getAdminDashboard(): Promise<AdminDashboardData>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPromoCodes(): Promise<Array<PromoCode>>;
    getArchivedOrders(): Promise<Array<Order>>;
    getAuditLog(): Promise<Array<AuditLogEntry>>;
    getCallerOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: string): Promise<Order | null>;
    getPromoCode(code: string): Promise<PromoCode | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerVIP(): Promise<boolean>;
    isUserBanned(user: Principal): Promise<boolean>;
    isUserVIP(user: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTrackingNumber(orderId: string, trackingNumber: string): Promise<void>;
    setVIPStatus(user: Principal, isVIP: boolean): Promise<void>;
    unbanUser(user: Principal): Promise<void>;
    updateOrderDetails(orderId: string, newDetails: Details, newAddress: Address): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    validatePromoCode(code: string): Promise<PromoCodeValidation>;
}
