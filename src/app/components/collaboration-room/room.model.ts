export interface Room {
    id: number;
    creator: string;
    file: string;
    user: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
}