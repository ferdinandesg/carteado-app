export { default } from "next-auth/middleware";

// Configuração para definir quais rotas serão protegidas
export const config = {
  matcher: ["/menu/:path*", "/rooms/:path*", "/room/:path*"],
};
