import FileInput from "./FileInput"

export default {
  // eslint-disable-next-line no-unused-vars
  install(Vue, options) {
    Vue._truncate = {
			line(line, length) {
				return line.substring(0, length);
			}
    };
    
    Vue.component('file-input', FileInput)
	
		Object.defineProperties(Vue.prototype, {
			$_truncate: {
				get() {
					return Vue._truncate;
				}
			}
		});
  },
};
