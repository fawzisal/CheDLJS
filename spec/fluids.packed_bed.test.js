import * as packed_bed from '../src/fluids.packed_bed.js';

import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js' ;

let dP, dP1, dP2, dP3, dP4, dP5, v;

test( 'test_Ergun', () => {
    dP = packed_bed.Ergun( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1338.8671874999995);

})
test( 'test_Kuo_Nydegger', () => {
    dP = packed_bed.Kuo_Nydegger( {dp: 8E-1, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 0.025651460973648624);

})
test( 'test_Jones_Krier', () => {
    dP = packed_bed.Jones_Krier( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1362.2719449873746);

})
test( 'test_Carman', () => {
    dP = packed_bed.Carman( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1614.721678121775);

})
test( 'test_Hicks', () => {
    dP = packed_bed.Hicks( {dp: 0.01, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 3.631703956680737);

})
test( 'test_Brauer', () => {
    dP = packed_bed.Brauer( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1441.5479196020563);

})
test( 'test_KTA', () => {
    dP = packed_bed.KTA( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1440.409277034248);

})
test( 'test_Erdim_Akgiray_Demir', () => {
    dP = packed_bed.Erdim_Akgiray_Demir( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1438.2826958844414);

})
test( 'test_Tallmadge', () => {
    dP = packed_bed.Tallmadge( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1365.2739144209424);

})
test( 'test_Fahien_Schriver', () => {
    dP = packed_bed.Fahien_Schriver( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1470.6175541844711);

})
test( 'test_Idelchik', () => {
    dP = packed_bed.Idelchik( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    assert_close(dP, 1571.909125999067);

})
test( 'test_Harrison_Brunner_Hecker', () => {
    dP1 = packed_bed.Harrison_Brunner_Hecker( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    dP2 = packed_bed.Harrison_Brunner_Hecker( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, Dt: 1E-2 });
    assert_close1d([dP1, dP2], [1104.6473821473724, 1255.1625662548427]);

})
test( 'test_Montillet_Akkari_Comiti', () => {
    dP1 = packed_bed.Montillet_Akkari_Comiti( {dp: 0.0008, voidage: 0.4, L: 0.5, vs: 0.00132629120, rho: 1000., mu: 1.00E-003 });
    dP2 = packed_bed.Montillet_Akkari_Comiti( {dp: 0.08, voidage: 0.4, L: 0.5, vs: 0.05, rho: 1000., mu: 1.00E-003 });
    dP3 = packed_bed.Montillet_Akkari_Comiti( {dp: 0.08, voidage: 0.3, L: 0.5, vs: 0.05, rho: 1000., mu: 1.00E-003, Dt: 1.0 });
    assert_close1d([dP1, dP2, dP3], [1148.1905244077548, 212.67409611116554, 540.501305905986]);

})
test( 'test_dP_packed_bed', () => {
    dP1 = packed_bed.dP_packed_bed( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3 });
    dP2 = packed_bed.dP_packed_bed( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, Dt: 0.01 });
    dP3 = packed_bed.dP_packed_bed( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, Dt: 0.01, Method: 'Ergun' });
    dP4 = packed_bed.dP_packed_bed( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, Dt: 0.01, Method: 'Ergun', sphericity: 0.6 });
    dP5 = packed_bed.dP_packed_bed({dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3});
    assert_close1d([dP1, dP2, dP3, dP4, dP5], [1438.2826958844414, 1255.1625662548427, 1338.8671874999995, 3696.2890624999986, 1438.2826958844414]);

})
test( 'test_packed_bed_methods', () => {
    // REMOVE ONCE DEPRECATED
    let methods_dP_val = ['Harrison, Brunner & Hecker', 'Carman', 'Guo, Sun, Zhang, Ding & Liu', 'Hicks', 'Montillet, Akkari & Comiti', 'Idelchik', 'Erdim, Akgiray & Demir', 'KTA', 'Kuo & Nydegger', 'Ergun', 'Brauer', 'Fahien & Schriver', 'Jones & Krier', 'Tallmadge'];
    methods_dP_val.sort();

    for( let m of methods_dP_val ) {
        packed_bed.dP_packed_bed( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, Dt: 0.01, Method: m });
    }

    let all_methods = packed_bed.dP_packed_bed_methods( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, L: 1, Dt: 1e-2 });
    expect(packed_bed.dP_packed_bed_methods( {dp: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, L: 1.0 })[0]).toEqual('Erdim, Akgiray & Demir');
    expect(all_methods[0]).toEqual('Harrison, Brunner & Hecker');
    all_methods.sort();
    expect(all_methods).toEqual(methods_dP_val);

    expect(()=> {packed_bed.dP_packed_bed({dP: 8E-4, voidage: 0.4, vs: 1E-3, rho: 1E3, mu: 1E-3, Method: 'Fail' })}).toThrow();

})
test( 'test_voidage_Benyahia_Oneil', () => {
    v = packed_bed.voidage_Benyahia_Oneil({Dpe: 1E-3, Dt: 1E-2, sphericity: .8});
    assert_close(v, 0.41395363849210065);
})
test( 'test_voidage_Benyahia_Oneil_spherical', () => {
    v = packed_bed.voidage_Benyahia_Oneil_spherical({Dp: .001, Dt: .05});
    assert_close(v, 0.3906653157443224);
})
test( 'test_voidage_Benyahia_Oneil_cylindrical', () => {
    v = packed_bed.voidage_Benyahia_Oneil_cylindrical({Dpe: .01, Dt: .1, sphericity: .6});
    assert_close(v, 0.38812523109607894);
})

test('test_Guo_Sun', () => {
    dP = packed_bed.Guo_Sun( {dp: 14.2E-3, voidage: 0.492, vs: 0.6, rho: 1E3, mu: 1E-3, Dt: 40.9E-3 });
    assert_close(dP, 42019.529911473706);
})
    // Confirmed to be 42 kPa from a graph they provided

