// services/gemini.ts
import { blogService } from "./blogService";

// 把 blogService 原样导出
export * from "./blogService";
export { blogService };
export default blogService;
