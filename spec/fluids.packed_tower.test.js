import {dP_demister_dry_Setekleiv_Svendsen, Stichlmair_dry, dP_demister_wet_ElDessouky, separation_demister_ElDessouky, Robbins, dP_demister_dry_Setekleiv_Svendsen_lit, Stichlmair_wet, voidage_experimental, Stichlmair_flood, specific_area_mesh } from '../src/fluids.packed_tower.js' ;
import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js';

test('test_packed_tower', () => {
    let dP = dP_demister_dry_Setekleiv_Svendsen( {S: 250.0, voidage: .983, vs: 1.2, rho: 10.0, mu: 3E-5, L: 1.0 });
    assert_close(dP, 320.3280788941329);
    dP = dP_demister_dry_Setekleiv_Svendsen_lit( {S: 250.0, voidage: .983, vs: 1.2, rho: 10.0, mu: 3E-5, L: 1.0 });
    assert_close(dP, 209.083848658307);
    dP = voidage_experimental( {m: 126.0, rho: 8000.0, D: 1.0, H: 1.0 });
    assert_close(dP, 0.9799464771704212);

    let S = specific_area_mesh( {voidage: .934, d: 3e-4 });
    assert_close(S, 879.9999999999994);
})

test('test_Stichlmair', () => {
    let dP_dry = Stichlmair_dry( {Vg: 0.4, rhog: 5., mug: 5E-5, voidage: 0.68, specific_area: 260., C1: 32., C2: 7.0, C3: 1.0 });
    assert_close(dP_dry, 236.80904286559885);

    let dP_wet = Stichlmair_wet( {Vg: 0.4, Vl: 5E-3, rhog: 5., rhol: 1200., mug: 5E-5, voidage: 0.68, specific_area: 260., C1: 32., C2: 7., C3: 1. });
    assert_close(dP_wet, 539.8768237253518);

    let Vg = Stichlmair_flood( {Vl: 5E-3, rhog: 5., rhol: 1200., mug: 5E-5, voidage: 0.68, specific_area: 260., C1: 32., C2: 7., C3: 1. });
    assert_close(Vg, 0.6394323542687361);
})


test('test_dP_demister_wet_ElDessouky', () => {
    // Point from their figure 8
    let rho = 176.35;
    let V = 6.;
    let dw = 0.32;
    let dP_orig = 3.88178*rho**0.375798*V**0.81317*dw**-1.56114147;
    // 689.4685604448499, compares with maybe 690 Pa/m from figure

    let voidage = 1.0-rho/7999.;
    let dP = dP_demister_wet_ElDessouky({vs: V, voidage: voidage, d_wire: dw/1000.});
    assert_close(dP_orig, dP);
    assert_close(dP, 689.4685604448499);

    // Test length multiplier
    assert_close(dP*10, dP_demister_wet_ElDessouky({vs: V, voidage: voidage, d_wire: dw/1000., L: 10}));
})


test('test_separation_demister_ElDessouky', () => {
    // Point from their figure 6
    let dw = 0.2;
    let rho = 208.16;
    let d_p = 5;
    let V = 1.35;
    let eta1 = 17.5047*dw**-0.28264*rho**0.099625*V**0.106878*d_p**0.383197;
    eta1 /=100.; // Convert to a 0-1 basis.
    let voidage = 1-rho/7999.;
    console.log('eta1', eta1);
    console.log('eta', eta);

    let eta = separation_demister_ElDessouky({vs: V, voidage: voidage, d_wire: dw/1000., L: d_p/1000.});
    assert_close(eta, eta1);
    assert_close(eta, 0.8983693041263305);

    expect(separation_demister_ElDessouky({vs: 1.35, voidage: 0.92, d_wire: 0.0002, L: 0.005})).toEqual(1);
})


test('test_Robbins', () => {
    let dP = Robbins( {Fpd: 24.0, L: 12.2, G: 2.03, rhol: 1000., rhog: 1.1853, mul: 0.001, H: 2.0 });
    assert_close(dP, 619.6624593438099);
})




