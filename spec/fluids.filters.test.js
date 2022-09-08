import * as filters from '../src/fluids.filters.js';
import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js' ;

test('test_round_edge_screen', () => {
    let K1 = filters.round_edge_screen({alpha: 0.5, Re: 100.0});
    let K2 = filters.round_edge_screen({alpha: 0.5, Re: 100, angle: 45.0});
    let K3 = filters.round_edge_screen({alpha: 0.5, Re: 100, angle: 85});

    assert_close1d([K1, K2, K3], [2.0999999999999996, 1.05, 0.18899999999999997]);
})

test('test_round_edge_open_mesh types', () => {
    let Ks = ['round bar screen', 'diamond pattern wire', 'knotted net', 'knotless net'].map( i =>filters.round_edge_open_mesh({alpha: 0.88, subtype: i}) );
    let K_values = [0.11687999999999998, 0.09912, 0.15455999999999998, 0.11664];
    assert_close1d(Ks, K_values);
    expect(()=>{filters.round_edge_open_mesh({alpha: 0.96, subtype: 'not_filter', angle: 33. })}).toThrow('Subtype not recognized');
})
test('test_round_edge_open_mesh', () => {
    let K1 = filters.round_edge_open_mesh({alpha: 0.96, angle: 33. });
    let K2 = filters.round_edge_open_mesh({alpha: 0.96, angle: 50 });
    assert_close1d([K1, K2], [0.02031327712601458, 0.012996000000000014]);
})

test('test_square_edge_screen', () => {
    let K = filters.square_edge_screen({alpha: 0.99});
    assert_close(K, 0.008000000000000009);
})

test('test_square_edge_grill', () => {
    let K1 = filters.square_edge_grill({alpha: .45});
    let K2 = filters.square_edge_grill({alpha: .45, l: .15, Dh: .002, fd: .0185 });
    assert_close1d([K1, K2], [5.296296296296296, 12.148148148148147]);
})

test('test_round_edge_grill', () => {
    let K1 = filters.round_edge_grill({alpha: .4});
    let K2 = filters.round_edge_grill({alpha: .4,  l: .15, Dh: .002, fd: .0185 });
    assert_close1d([K1, K2], [1.0, 2.3874999999999997]);
})

// TODO: replace scipy test, uncomment
// @pytest.mark.scipy
// function test_grills_rounded() {
//     const { splrep } = require( './scipy.interpolate' );
// const { grills_rounded_tck, grills_rounded_alphas, grills_rounded_Ks } = require( './fluids.filters' );
//     let tck_recalc = splrep(grills_rounded_alphas, grills_rounded_Ks, { s: 0, k: 2 });
//  _pyjs.listZip(grills_rounded_tck.slice( 0,-1 ), tck_recalc.slice( 0,-1 )).map( ( [ i, j ] ) =>assert_close1d(i, j) );
// }



