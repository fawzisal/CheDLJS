import * as saltation from '../src/fluids.saltation.js';

// TODO: figure out why all tests here are not precise (~0.03% off)
const { assert_close, assert_close1d } = require( '../src/fluids.test_helpers.js' );
test('test_Rizk', () => {
    let V1 = saltation.Rizk({mp: 0.25, dp: 100E-6, rhog: 1.2, D: 0.078});
    assert_close(V1, 9.8833092829357, 1e-3);
})

test('test_Matsumoto_1974', () => {
    let V2 = saltation.Matsumoto_1974( {mp: 1., rhop: 1000., dp: 1E-3, rhog: 1.2, D: 0.1, Vterminal: 5.24 });
    assert_close(V2, 19.583617317317895, 1e-3);
})

test('test_Matsumoto_1975', () => {
    let V3 = saltation.Matsumoto_1975( {mp: 1., rhop: 1000., dp: 1E-3, rhog: 1.2, D: 0.1, Vterminal: 5.24 });
    assert_close(V3, 18.04523091703009, 1e-3);
})

test('test_Matsumoto_1977', () => {
    let V1 = saltation.Matsumoto_1977( {mp: 1., rhop: 1000., dp: 1E-3, rhog: 1.2, D: 0.1, Vterminal: 5.24 });
    let V2 = saltation.Matsumoto_1977( {mp: 1., rhop: 600., dp: 1E-3, rhog: 1.2, D: 0.1, Vterminal: 5.24 });
    assert_close1d([V1, V2], [16.64284834446686, 10.586175424073561], 1e-3);
})

test('test_Schade', () => {
    let V1 = saltation.Schade( {mp: 1., rhop: 1000., dp: 1E-3, rhog: 1.2, D: 0.1 });
    assert_close(V1, 13.697415809497912, 1e-3);
})

test('test_Weber_saltation', () => {
    let V1 = saltation.Weber_saltation( {mp: 1.0, rhop: 1000., dp: 1E-3, rhog: 1.2, D: 0.1, Vterminal: 4.0 });
    let V2 = saltation.Weber_saltation( {mp: 1.0, rhop: 1000., dp: 1E-3, rhog: 1.2, D: 0.1, Vterminal: 2.0 });
    assert_close1d([V1, V2], [15.227445436331474, 13.020222930460088], 1e-3);
})

test('test_Geldart_Ling', () => {
    let V1 = saltation.Geldart_Ling({mp: 1., rhog: 1.2, D: 0.1, mug: 2E-5});
    let V2 = saltation.Geldart_Ling({mp: 50., rhog: 1.2, D: 0.1, mug: 2E-5});
    assert_close1d([V1, V2], [7.467495862402707, 44.01407469835619], 1e-3);
})

