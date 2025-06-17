declare namespace Express {
  export interface Request {
    domain?: string;
    em?: import("@mikro-orm/core").EntityManager;
    tenant?: import("../entities/Organisation").Organisation;
  }
}
