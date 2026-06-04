
import { createRegisterUseCase } from "../../src/services/auth/use-cases/register.use-case.js";
import { createLoginUseCase } from "../../src/services/auth/use-cases/login.use-case.js";
import { ConflictError } from "../../src/exceptions/conflict-error.js";
import { AuthenticationError } from "../../src/exceptions/authentication-error.js";

const mockUser = {
  id: "user-uuid-1",
  email: "rani@example.com",
  full_name: "Rani Pratiwi",
  created_at: new Date("2026-05-30T08:00:00Z"),
};
const mockUserWithHash = {
  ...mockUser,
  password_hash: "$2b$12$hashedpassword",
};

describe("register.use-case", () => {
  const authRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const passwordManager = {
    hash: jest.fn().mockResolvedValue("$2b$12$hashedpassword"),
    compare: jest.fn(),
  };
  beforeEach(() => jest.clearAllMocks());
  it("menolak email duplikat dengan ConflictError (FR-001)", async () => {
    authRepo.findByEmail.mockResolvedValue(mockUserWithHash);
    const useCase = createRegisterUseCase({ authRepo, passwordManager });
    await expect(
      useCase.execute({
        full_name: "A",
        email: "rani@example.com",
        password: "secret123",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(authRepo.createUser).not.toHaveBeenCalled();
  });
  it("membuat user baru dan mengembalikan data tanpa password_hash (SEC-001)", async () => {
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue(mockUser);
    const useCase = createRegisterUseCase({ authRepo, passwordManager });
    const user = await useCase.execute({
      full_name: "Rani Pratiwi",
      email: "rani@example.com",
      password: "secret123",
    });
    expect(passwordManager.hash).toHaveBeenCalledWith("secret123");
    expect(authRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "rani@example.com",
        password_hash: "$2b$12$hashedpassword",
      }),
    );
    expect(user).not.toHaveProperty("password_hash");
    expect(user.email).toBe("rani@example.com");
  });
});

describe("login.use-case", () => {
  const authRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const passwordManager = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const tokenManager = {
    sign: jest.fn().mockReturnValue("mock.jwt.token"),
    verify: jest.fn(),
  };
  beforeEach(() => jest.clearAllMocks());
  it("melempar AuthenticationError dengan pesan generik bila email tidak ditemukan (FR-002)", async () => {
    authRepo.findByEmail.mockResolvedValue(null);
    const useCase = createLoginUseCase({
      authRepo,
      passwordManager,
      tokenManager,
    });
    await expect(
      useCase.execute({ email: "notfound@example.com", password: "secret" }),
    ).rejects.toBeInstanceOf(AuthenticationError);
    await expect(
      useCase.execute({ email: "notfound@example.com", password: "secret" }),
    ).rejects.toMatchObject({ message: "Email atau password salah" });
  });
  it("melempar AuthenticationError dengan pesan generik bila password salah (FR-002)", async () => {
    authRepo.findByEmail.mockResolvedValue(mockUserWithHash);
    passwordManager.compare.mockResolvedValue(false);
    const useCase = createLoginUseCase({
      authRepo,
      passwordManager,
      tokenManager,
    });
    await expect(
      useCase.execute({ email: "rani@example.com", password: "wrongpassword" }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
  it("mengembalikan token + user tanpa password_hash saat login sukses (SEC-001)", async () => {
    authRepo.findByEmail.mockResolvedValue(mockUserWithHash);
    passwordManager.compare.mockResolvedValue(true);
    const useCase = createLoginUseCase({
      authRepo,
      passwordManager,
      tokenManager,
    });
    const result = await useCase.execute({
      email: "rani@example.com",
      password: "secret123",
    });
    expect(result.token).toBe("mock.jwt.token");
    expect(result.user).not.toHaveProperty("password_hash");
    expect(result.user.email).toBe("rani@example.com");
    expect(tokenManager.sign).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockUser.id, email: mockUser.email }),
    );
  });
});
