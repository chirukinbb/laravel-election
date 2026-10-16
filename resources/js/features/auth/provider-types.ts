export interface AccountSession {
  user: { id: string; email: string; name: string; emailVerified: boolean };
}

/** Provider-independent application boundary; credentials never reach account UI props. */
export interface AccountProvider {
  handle(request: Request): Promise<Response>;
  getSession(headers: Headers): Promise<AccountSession | null>;
  close?(): void;
}
