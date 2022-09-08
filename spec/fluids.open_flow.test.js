import * as open_flow from '../src/fluids.open_flow.js' ;
const { assert_close, assert_close1d } = require( '../src/fluids.test_helpers.js' );
const { sum } = require( '../src/fluids.numerics_init.js' );

test('test_open_Q_weir_V_Shen', () => {
    let Q1 = open_flow.Q_weir_V_Shen({h1: 0.6, angle: 45 });
    let Q2 = open_flow.Q_weir_V_Shen({h1: 1.2});

    assert_close1d([Q1, Q2], [0.21071725775478228, 2.8587083148501078]);
})
test('test_open_Q_weir_rectangular_Kindsvater_Carter', () => {
    let Q1 = open_flow.Q_weir_rectangular_Kindsvater_Carter({h1: 0.2, h2: 0.5, b: 1.0});
    assert_close(Q1, 0.15545928949179422);
})
test('test_Q_weir_rectangular_SIA', () => {

    let Q1 = open_flow.Q_weir_rectangular_SIA({h1: 0.2, h2: 0.5, b: 1.0, b1: 2.0});
    assert_close(Q1, 1.0408858453811165);
})
test('test_Q_weir_rectangular_full_Ackers', () => {

    let Q1 = open_flow.Q_weir_rectangular_full_Ackers( {h1: 0.9, h2: 0.6, b: 5.0 });
    let Q2 = open_flow.Q_weir_rectangular_full_Ackers( {h1: 0.3, h2: 0.4, b: 2.0 });
    assert_close1d([Q1, Q2], [9.251938159899948, 0.6489618999846898]);
})
test('test_Q_weir_rectangular_full_SIA', () => {

    let Q1 = open_flow.Q_weir_rectangular_full_SIA( {h1: 0.3, h2: 0.4, b: 2.0 });
    assert_close(Q1, 1.1875825055400384);
})
test('test_Q_weir_rectangular_full_Rehbock', () => {

    let Q1 = open_flow.Q_weir_rectangular_full_Rehbock( {h1: 0.3, h2: 0.4, b: 2.0 });
    assert_close(Q1, 0.6486856330601333);
})
test('test_Q_weir_rectangular_full_Kindsvater_Carter', () => {

    let Q1 = open_flow.Q_weir_rectangular_full_Kindsvater_Carter( {h1: 0.3, h2: 0.4, b: 2.0 });
    assert_close(Q1, 0.641560300081563);
})
test('test_V_Manning', () => {

    let V1 = open_flow.V_Manning({Rh: 0.2859, S: 0.005236, n: 0.03})*0.5721;
    let V2 = open_flow.V_Manning({Rh: 0.2859, S: 0.005236, n: 0.03});
    let V3 = open_flow.V_Manning( {Rh: 5, S: 0.001, n: 0.05 });
    assert_close1d([V1, V2, V3], [0.5988618058239864, 1.0467781958118971, 1.8493111942973235]);
})
test('test_n_Manning_to_C_Chezy', () => {

    let C = open_flow.n_Manning_to_C_Chezy({n:0.05, Rh: 5.0 });
    assert_close(C, 26.15320972023661);
})
test('test_C_Chezy_to_n_Manning', () => {

    let n = open_flow.C_Chezy_to_n_Manning({C: 26.15, Rh: 5.0 });
    assert_close(n, 0.05000613713238358);
})
test('test_V_Chezy', () => {

    let V = open_flow.V_Chezy( {Rh: 5.0, S: 0.001, C: 26.153 });
    assert_close(V, 1.8492963648371776);

})
test('test_n_dicts', () => {
    let n_tot = 0.0;
    for( let thing of open_flow.n_dicts ) {
        for( let val of Object.values(thing) ) {
            for( let vals of Object.values(val) ) {
                n_tot += Math.abs(sum(vals));
            }

        }
    }
    assert_close(n_tot, 11.115999999999984);
})

