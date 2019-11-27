const setupFlat = () => {
  Object.defineProperty(Array.prototype, 'flat', {
    value(depth = 1) {
      return this.reduce((flat, toFlatten) => {
        return flat.concat(
          Array.isArray(toFlatten) && depth > 1
            ? toFlatten.flat(depth - 1)
            : toFlatten
        );
      }, []);
    },
  });
};

export default {setupFlat};
