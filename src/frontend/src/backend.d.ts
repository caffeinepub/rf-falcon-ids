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
export interface SecurityEvent {
    result: Variant_allowed_denied_throttled;
    principal: Principal;
    action: string;
    timestamp: Time;
    reason: string;
}
export interface AuditLogEntry {
    action: string;
    admin: Principal;
    timestamp: Time;
    details: string;
}
export interface Order {
    id: string;
    status: Status;
    trackingNumber?: string;
    owner?: Principal;
    creationTime: Time;
    address: Address;
    details: Details;
    photo: ExternalBlob;
}
export interface AdminDashboardData {
    orders: Array<Order>;
    auditLog: Array<AuditLogEntry>;
    userProfiles: Array<[Principal, UserProfile]>;
    securityStats: SecurityStats;
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
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    approved = "approved"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_allowed_denied_throttled {
    allowed = "allowed",
    denied = "denied",
    throttled = "throttled"
}
export interface backendInterface {
    addToAllowlist(principal: Principal): Promise<void>;
    addToBlocklist(principal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkApproveOrders(orderIds: Array<string>): Promise<void>;
    bulkDeleteOrders(orderIds: Array<string>): Promise<void>;
    bulkShipOrders(orderIds: Array<string>): Promise<void>;
    clearSecurityCounters(): Promise<void>;
    createOrder(id: string, details: Details, address: Address, photo: ExternalBlob): Promise<void>;
    createOrderWithCallback(id: string, details: Details, address: Address, photo: ExternalBlob): Promise<Order>;
    deleteOrder(orderId: string): Promise<void>;
    exportOrdersCSV(): Promise<string>;
    getAdminDashboard(): Promise<AdminDashboardData>;
    getAllOrders(): Promise<Array<Order>>;
    getAuditLog(limit: bigint): Promise<Array<AuditLogEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: string): Promise<Order | null>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getSecurityConfig(): Promise<{
        blocklistSize: bigint;
        allowlistSize: bigint;
        rateLimitWindow: bigint;
        maxCallsPerWindow: bigint;
        enabled: boolean;
    }>;
    getSecurityEvents(limit: bigint): Promise<Array<SecurityEvent>>;
    getSecurityStats(): Promise<SecurityStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAdminAccess(admin_email: string): Promise<void>;
    isAdminEmail(email: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isOrderOwner(orderId: string): Promise<boolean>;
    listAdminEmails(): Promise<Array<string>>;
    removeFromAllowlist(principal: Principal): Promise<void>;
    removeFromBlocklist(principal: Principal): Promise<void>;
    resetAllData(): Promise<void>;
    revokeAdminAccess(admin_email: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSecurityEnabled(enabled: boolean): Promise<void>;
    setTrackingNumber(orderId: string, trackingNumber: string): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateRateLimits(rateLimitWindow: bigint, maxCallsPerWindow: bigint): Promise<void>;
}
