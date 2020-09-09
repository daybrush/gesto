
import Dragger, * as modules from "./index";

for (const name in modules) {
    (Dragger as any)[name] = (modules as any)[name];
}

export default Dragger;
