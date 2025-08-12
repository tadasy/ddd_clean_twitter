import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{
  title: "DDD Clean Twitter API",
  version: "0.1.0"
})
@server("http://localhost:3000", "Local server")
namespace ApiSpec {
  @route("/api")
  namespace Api {
    // Schemas
    model ErrorResponse { error: string; }

    model User { id: int32; name: string; email: string; }
    model Post { id: int32; userId: int32; message: string; }
    model FavoriteCount { postId: int32; count: int32; }
    model FavoritePostIds { userId: int32; postIds: int32[]; }

    model CreateUserRequest { name: string; email: string; }
    model CreateUserResponse { id: int32; name: string; email: string; }

    model CreatePostRequest { message: string; }
    model CreatePostResponse { id: int32; userId: int32; message: string; }

    model LoginRequest { email: string; }
    model LoginResponse { token: string; user: User; }
    model MeResponse { sub: string; email: string; }
    model OkResponse { ok: boolean; }

    // Security
    @useAuth(BearerAuth)
    interface Authed {}

    @route("/users")
    interface Users {
      @get list(): User[] | ErrorResponse;
      @post create(@body body: CreateUserRequest): CreateUserResponse | ErrorResponse;
      @get @route("/{id}/posts") listUserPosts(@path id: int32): Post[] | ErrorResponse;
      @get @route("/{id}/favorites") listUserFavorites(@path id: int32): FavoritePostIds | ErrorResponse;
    }

    @route("/posts")
    interface Posts {
      @get list(): Post[] | ErrorResponse;
      @post @useAuth(BearerAuth) create(@body body: CreatePostRequest): CreatePostResponse | ErrorResponse;
      @get @route("/{id}/favorites/count") favoriteCount(@path id: int32): FavoriteCount | ErrorResponse;
    }

    @route("/favorites")
    interface Favorites extends Authed {
      @post @route("/toggle") toggle(@body body: { postId: int32 }): OkResponse | ErrorResponse;
    }

    @route("/auth")
    interface Auth {
      @post @route("/login") login(@body body: LoginRequest): LoginResponse | ErrorResponse;
      @get @route("/me") @useAuth(BearerAuth) me(): MeResponse | ErrorResponse;
    }
  }
}
