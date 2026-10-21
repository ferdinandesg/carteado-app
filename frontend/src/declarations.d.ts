// next-env.d.ts é gerado pelo Next e fica fora do git; o typecheck do CI roda antes do build.
/// <reference types="next/image-types/global" />

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
