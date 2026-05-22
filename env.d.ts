/// <reference types="vitepress/client" />

declare module "virtual:group-icons.css";

declare module "*.css" {
  const content: string;
  export default content;
}
