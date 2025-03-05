export interface User {
  id: string;
  name: string;
  username: string;
  token: string;
  status: string;
  creationDate: string | Date;
  birthday?: string | Date | null;
  password?: string;
}
