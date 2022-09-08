expect.extend({
  toBeAlmost(a, b, rtol=1e-7, atol=0.0) {
    let diff = Math.abs((a-b)/Math.max(a, b));
    const pass = (diff <= rtol) || (Math.abs(a-b)<=atol);
    if (pass) {
      return {
        message: () =>
          `did not expect ${a}, ${b} to be within ${rtol} (relatively) or ${atol} (absolutely)`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${a}, ${b} to be within ${rtol} (relatively) or ${atol} (absolutely)`,
        pass: false,
      };
    }
  },
});

export function assert_close(a, b, rtol=1e-7, atol=0.0) {
    if( Object.is( a, b ) ) {
        return true;
    }
    expect(a).toBeAlmost(b, rtol, atol);
    return;
}
export function assert_close1d(a, b, rtol=1e-7, atol=0.0) {
    let N = a.length;
    if( N !== b.length ) {
        throw new Error( `ValueError - Variables are not the same length: ${a.length}, ${b.length}` );
    }
    a.map((v, k) => expect(v).toBeAlmost(b[k], rtol, atol));
}

