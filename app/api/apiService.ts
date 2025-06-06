import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";
import { generateUUID } from "@/utils/uuid";

//ApiService class to handle API requests
export class ApiService {
  private baseURL: string; // Base URL for API requests
  private defaultHeaders: HeadersInit; // Default headers for API requests
  private currentUserId?: string | null; // Current user ID for authenticated requests

  constructor() {
    this.baseURL = getApiDomain(); //Initialize base URL from a utility function
    this.defaultHeaders = {
      "Content-Type": "application/json", //Default headers for JSON content
    };
  }

  /**
   * Get authentication token from localStorage
   * @returns The stored auth token or null if not available
   */
  private getAuthToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  /**
   * Set the current user ID for authenticated requests
   * @param userId - The ID of the current user or null to clear
   */
  public setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId;
    console.log("ApiService - setting currentUserId:", userId);
  }

  /**
   * Get headers with authentication and tracking information
   * @returns Headers with auth token, user ID, and client ID
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { ...this.defaultHeaders };
    const authToken = this.getAuthToken();

    // Add authentication token if available
    if (authToken) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${authToken}`;
    }

    // Add current user ID if available
    if (this.currentUserId) {
      (headers as Record<string, string>)["CurrentUserId"] = String(
        this.currentUserId,
      );
      console.log("Request headers with CurrentUserId:", this.currentUserId);
    }

    return headers;
  }

  /**
   * Helper function to check the response, parse JSON if content exists,
   * and throw an error if the response is not OK.
   *
   * @param res - The response from fetch.
   * @param errorMessage - A descriptive error message for this call.
   * @returns Parsed JSON data or empty object for 204 responses.
   * @throws ApplicationError if res.ok is false.
   */
  private async processResponse<T>(
    res: Response,
    errorMessage: string,
  ): Promise<T> {
    // Handle token expiration or invalid tokens
    if (res.status === 401) {
      // Clear token if it's invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        console.log("Cleared invalid auth token after 401 response");
      }
    }

    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        // Only try to parse JSON if there's content
        if (res.status !== 204 && res.headers.get("content-length") !== "0") {
          const errorInfo = await res.json();
          if (errorInfo?.message) {
            errorDetail = errorInfo.message;
          } else {
            errorDetail = JSON.stringify(errorInfo);
          }
        }
      } catch {
        // If parsing fails, keep using res.statusText
      }
      const detailedMessage = `${errorMessage} (${res.status}: ${errorDetail})`;
      const error: ApplicationError = new Error(
        detailedMessage,
      ) as ApplicationError;
      error.info = JSON.stringify(
        { status: res.status, statusText: res.statusText },
        null,
        2,
      );
      error.status = res.status;
      throw error;
    }

    // For 204 No Content responses, return an empty object
    if (res.status === 204) {
      return {} as T;
    }

    // Otherwise parse JSON
    return res.headers.get("Content-Type")?.includes("application/json")
      ? res.json() as Promise<T>
      : Promise.resolve(res as T);
  }

  /**
   * GET request.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @returns JSON data of type T.
   */
  public async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      mode: "cors",
      credentials: "same-origin", // Include credentials for same-origin requests
    });
    return this.processResponse<T>(
      res,
      "An error occurred while fetching the data.\n",
    );
  }

  /**
   * POST request.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @param data - The payload to post.
   * @returns JSON data of type T.
   */
  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "same-origin",
    });
    return this.processResponse<T>(
      res,
      "An error occurred while posting the data.\n",
    );
  }

  /**
   * PUT request.
   * @param endpoint - The API endpoint (e.g. "/users/123").
   * @param data - The payload to update.
   * @returns JSON data of type T or empty object for 204 responses.
   */
  public async put<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(
      `Making PUT request to ${url} with CurrentUserId: ${this.currentUserId}`,
    );

    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "same-origin",
    });

    // For 204 responses, we don't need to parse the body
    if (res.status === 204) {
      console.log("Received 204 No Content response, returning empty object");
      return {} as T;
    }

    return this.processResponse<T>(
      res,
      "An error occurred while updating the data.\n",
    );
  }

  /**
   * DELETE request.
   * @param endpoint - The API endpoint (e.g. "/users/123" or "/game-lobby/123").
   * @param data - Optional data to send with the DELETE request.
   * @returns JSON data of type T or empty object for 204 responses.
   */
  public async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`Making DELETE request to: ${url}`);

    const options: RequestInit = {
      method: "DELETE",
      headers: this.getHeaders(),
      mode: "cors",
      credentials: "same-origin",
    };

    // Only add body if data is provided
    if (data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);

    return this.processResponse<T>(
      res,
      "An error occurred while deleting the data.\n",
    );
  }
}
