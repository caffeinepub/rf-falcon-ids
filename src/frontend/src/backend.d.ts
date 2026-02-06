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
export interface UserProfile {
    name: string;
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
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(id: string, details: Details, address: Address, photo: ExternalBlob): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: string): Promise<Order | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTrackingNumber(orderId: string, trackingNumber: string): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
}
