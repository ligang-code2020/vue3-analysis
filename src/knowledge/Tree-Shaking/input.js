import { foo } from "./utils";

/**
 * #__PURE__
 * 其作用就是告诉 rollup.js，对于foo函数的调用不会产生副作用，你可以放心地对其进行 Tree-Shaking
 */ 

/*#__PURE__*/ foo()