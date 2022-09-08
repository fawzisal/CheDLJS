import * as compressible from '../src/fluids.compressible.js';
import { psi, foot, inch, day } from '../src/fluids.constants.js';
import { F2K } from '../src/fluids.core.js' ;
import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js' ;

test('test_isothermal_work_compression', ()=> {
    assert_close(compressible.isothermal_work_compression({P1: 1E5, P2: 1E6, T: 300.0}), 5743.425357533477, 5);
})


test('test_isentropic_work_compression', ()=> {
    let dH = compressible.isentropic_work_compression( {P1: 1E5, P2: 1E6, T1: 300.0, k: 1.4, eta: 1 });
    assert_close(dH, 8125.161295388634, 5);

    dH = compressible.isentropic_work_compression( {P1: 1E5, P2: 1E6, T1: 300, k: 1.4, eta: 0.78 });
    assert_close(dH, 10416.873455626454, 5);

    dH = compressible.isentropic_work_compression( {P1: 1E5, P2: 1E6, T1: 300, k: 1.4, eta: 0.78, Z: 0.9 });
    assert_close(dH, 9375.186110063809, 5);

    // Other solutions - P1, P2, and eta
    let P1 = compressible.isentropic_work_compression( {W: 9375.186110063809, P2: 1E6, T1: 300., k: 1.4, eta: 0.78, Z: 0.9 });
    assert_close(P1, 1E5, 5);

    let P2 = compressible.isentropic_work_compression( {W: 9375.186110063809, P1: 1E5, T1: 300., k: 1.4, eta: 0.78, Z: 0.9 });
    assert_close(P2, 1E6, 5);

    let eta = compressible.isentropic_work_compression( {W: 9375.186110063809, P1: 1E5, P2: 1E6, T1: 300, k: 1.4, Z: 0.9, eta: null });
    assert_close(eta, 0.78, 5);

    expect(()=>{compressible.isentropic_work_compression( {P1: 1E5, P2: 1E6, k: 1.4, T1: null });}).toThrow(Error);


})
test('test_isentropic_T_rise_compression', ()=> {
    let T2 = compressible.isentropic_T_rise_compression({T1: 286.8, P1: 54050.0, P2: 432400., k: 1.4});
    assert_close(T2, 519.5230938217768, 5);

    T2 = compressible.isentropic_T_rise_compression({T1: 286.8, P1: 54050, P2: 432400, k: 1.4, eta: 0.78 });
    assert_close(T2, 585.1629407971498, 5);

    // Test against the simpler formula for eta=1:
    // T2 = T2*(P2/P1)^((k-1)/k)
    let T2_ideal = 286.8*((432400/54050)**((1.4-1)/1.4));
    assert_close(T2_ideal, 519.5230938217768, 5);
})


test('test_isentropic_efficiency', ()=> {
    let eta_s = compressible.isentropic_efficiency({P1: 1E5, P2: 1E6, k: 1.4, eta_p: 0.78 });
    assert_close(eta_s, 0.7027614191263858);
    let eta_p = compressible.isentropic_efficiency({P1: 1E5, P2: 1E6, k: 1.4, eta_s: 0.7027614191263858 });
    assert_close(eta_p, 0.78);

    expect(()=>{compressible.isentropic_efficiency({P1: 1E5, P2: 1E6, k: 1.4});}).toThrow(Error);

    // Example 7.6 of the reference:
    eta_s = compressible.isentropic_efficiency({P1: 1E5, P2: 3E5, k: 1.4, eta_p: 0.75 });
    assert_close(eta_s, 0.7095085923615653);
    eta_p =  compressible.isentropic_efficiency({P1: 1E5, P2: 3E5, k: 1.4, eta_s: eta_s });
    assert_close(eta_p, 0.75);
})


test('test_polytropic_exponent', ()=> {
    assert_close(compressible.polytropic_exponent({k: 1.4, eta_p: 0.78 }), 1.5780346820809246);
    assert_close(compressible.polytropic_exponent({k: 1.4, n: 1.5780346820809246 }), 0.78);
    expect(()=>{compressible.polytropic_exponent({k: 1.4});}).toThrow(Error);


})
test('test_compressible', ()=> {
    let T = compressible.T_critical_flow({T: 473., k: 1.289});
    assert_close(T, 413.2809086937528);

    let P = compressible.P_critical_flow({P: 1400000., k: 1.289});
    assert_close(P, 766812.9022792266);

    expect(!compressible.is_critical_flow({P1: 670E3, P2: 532E3, k: 1.11})).toEqual(true);
    expect(compressible.is_critical_flow({P1: 670E3, P2: 101E3, k: 1.11})).toEqual(true);

    let SE = compressible.stagnation_energy(125.);
    assert_close(SE, 7812.5);

    let PST = compressible.P_stagnation({P: 54050., T: 255.7, Tst: 286.8, k: 1.4});
    assert_close(PST, 80772.80495900588);

    let Tst = compressible.T_stagnation({T: 286.8, P: 54050., Pst: 54050*8., k: 1.4});
    assert_close(Tst, 519.5230938217768);

    let Tstid = compressible.T_stagnation_ideal({T: 255.7, V: 250., Cp: 1005.});
    assert_close(Tstid, 286.79452736318405);
})


test('test_Panhandle_A', ()=> {
    // Example 7-18 Gas of Crane TP 410M
    let D = 0.340;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 42.56082051195928;

    // Test all combinations of relevant missing inputs
    assert_close(compressible.Panhandle_A( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Panhandle_A( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Panhandle_A( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2);
    assert_close(compressible.Panhandle_A( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Panhandle_A( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Panhandle_A( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);

    // Sample problem from "Natural Gas Pipeline Flow Calculations" by "Harlan H. Bengtson"
    let Q_panhandle = compressible.Panhandle_A( {SG: 0.65, Tavg: F2K(80), Ts: F2K(60), Ps: 14.7*psi, L: 500*foot, D: 12*inch, P1: 510*psi,
                          P2: 490*psi, Zavg: 0.919, E: 0.92 });
    let mmscfd = Q_panhandle*day/foot**3/1e6;
    assert_close(mmscfd, 401.3019451856126, 12);
})


test('test_Panhandle_B', ()=> {
    // Example 7-18 Gas of Crane TP 410M
    let D = 0.340;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 42.35366178004172;

    // Test all combinations of relevant missing inputs
    assert_close(compressible.Panhandle_B( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Panhandle_B( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Panhandle_B( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2);
    assert_close(compressible.Panhandle_B( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Panhandle_B( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Panhandle_B( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);


})
test('test_Weymouth', ()=> {
    let D = 0.340;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 32.07729055913029;
    assert_close(compressible.Weymouth( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Weymouth( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Weymouth( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2);
    assert_close(compressible.Weymouth( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Weymouth( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Weymouth( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);

    let Q_Weymouth = compressible.Weymouth( {SG: 0.65, Tavg: F2K(80), Ts: F2K(60), Ps: 14.7*psi, L: 500*foot, D: 12*inch, P1: 510*psi,
                              P2: 490*psi, Zavg: 0.919, E: 0.92 });
    let mmscfd = Q_Weymouth*day/foot**3/1e6;
    assert_close(mmscfd, 272.5879686092862, 12);
})

test('test_Spitzglass_high', ()=> {

    let D = 0.340;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 29.42670246281681;
    assert_close(compressible.Spitzglass_high( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Spitzglass_high( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Spitzglass_high( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2);
    assert_close(compressible.Spitzglass_high( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Spitzglass_high( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Spitzglass_high( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);


})
test('test_Spitzglass_low', ()=> {
    let D = 0.154051;
    let P1 = 6720.3199;
    let P2 = 0.0;
    let L = 54.864;
    let SG = 0.6;
    let Tavg = 288.7;
    let Q = 0.9488775242530617;
    assert_close(compressible.Spitzglass_low( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Spitzglass_low( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Spitzglass_low( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2, 10);
    assert_close(compressible.Spitzglass_low( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Spitzglass_low( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Spitzglass_low( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);


})
test('test_Oliphant', ()=> {
    let D = 0.340;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 28.851535408143057;
    assert_close(compressible.Oliphant( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Oliphant( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Oliphant( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2);
    assert_close(compressible.Oliphant( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Oliphant( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Oliphant( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);


})
test('test_Fritzsche', ()=> {
    let D = 0.340;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 39.421535157535565;
    assert_close(compressible.Fritzsche( {D: D, P1: P1, P2: P2, L: L, SG: SG, Tavg: Tavg }), Q);
    assert_close(compressible.Fritzsche( {D: D, Q: Q, P2: P2, L: L, SG: SG, Tavg: Tavg }), P1);
    assert_close(compressible.Fritzsche( {D: D, Q: Q, P1: P1, L: L, SG: SG, Tavg: Tavg }), P2);
    assert_close(compressible.Fritzsche( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), L);
    assert_close(compressible.Fritzsche( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, Tavg: Tavg }), D);

    expect(()=>{compressible.Fritzsche( {D: 0.340, P1: 90E5, L: 160E3, SG: 0.693, Tavg: 277.15 });}).toThrow(Error);


})
test('test_Muller', ()=> {
    let D = 0.340;
    let mu = 1E-5;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 60.45796698148663;
    assert_close(compressible.Muller( {D: D, P1: P1, P2: P2, L: L, SG: SG, mu: mu, Tavg: Tavg }), Q);
    assert_close(compressible.Muller( {D: D, Q: Q, P2: P2, L: L, SG: SG, mu: mu, Tavg: Tavg }), P1);
    assert_close(compressible.Muller( {D: D, Q: Q, P1: P1, L: L, SG: SG, mu: mu, Tavg: Tavg }), P2);
    assert_close(compressible.Muller( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, mu: mu, Tavg: Tavg }), L);
    assert_close(compressible.Muller( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, mu: mu, Tavg: Tavg }), D);

    expect(()=>{compressible.Muller( {D: D, P2: P2, L: L, SG: SG, mu: mu, Tavg: Tavg });}).toThrow(Error);

})
test('test_IGT', ()=> {
    let D = 0.340;
    let mu = 1E-5;
    let P1 = 90E5;
    let P2 = 20E5;
    let L = 160E3;
    let SG=0.693;
    let Tavg = 277.15;
    let Q = 48.92351786788815;
    assert_close(compressible.IGT( {D: D, P1: P1, P2: P2, L: L, SG: SG, mu: mu, Tavg: Tavg }), Q);
    assert_close(compressible.IGT( {D: D, Q: Q, P2: P2, L: L, SG: SG, mu: mu, Tavg: Tavg }), P1);
    assert_close(compressible.IGT( {D: D, Q: Q, P1: P1, L: L, SG: SG, mu: mu, Tavg: Tavg }), P2);
    assert_close(compressible.IGT( {D: D, Q: Q, P1: P1, P2: P2, SG: SG, mu: mu, Tavg: Tavg }), L);
    assert_close(compressible.IGT( {L: L, Q: Q, P1: P1, P2: P2, SG: SG, mu: mu, Tavg: Tavg }), D);

    expect(()=>{compressible.IGT( {D: D, P2: P2, L: L, SG: SG, mu: mu, Tavg: Tavg });}).toThrow(Error);


})
test('test_isothermal_gas', ()=> {
    let mcalc = compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P1: 1E6, P2: 9E5, L: 1000., D: 0.5 });
    assert_close(mcalc, 145.484757264);
    assert_close(compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P1: 1E6, P2: 9E5, m: 145.484757264, D: 0.5 }), 1000);
    assert_close(compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P2: 9E5, m: 145.484757264, L: 1000., D: 0.5 }), 1E6);
    assert_close(compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P1: 1E6, m: 145.484757264, L: 1000., D: 0.5 }), 9E5);
    assert_close(compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P1: 1E6, P2: 9E5, m: 145.484757264, L: 1000. }), 0.5);

    expect(()=>{compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P1: 1E6, P2: 9E5, L: 1000. });}).toThrow(Error);
    expect(()=>{compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P1: 1E6, P2: 1E5, L: 1000., D: 0.5 });}).toThrow(Error);
    expect(()=>{compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, P2: 1E6, P1: 9E5, L: 1000., D: 0.5 });}).toThrow(Error);

    // Newton can't converge, need a bounded solver
    let P1 = compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, m: 390., P2: 9E5, L: 1000., D: 0.5 });
    assert_close(P1, 2298973.786533209);

    // Case where the desired flow is greater than the choked flow's rate
    expect(()=>{compressible.isothermal_gas( {rho: 11.3, fd: 0.00185, m: 400, P2: 9E5, L: 1000., D: 0.5 });}).toThrow(Error);

    // test the case where the ideal gas assumption is baked in:

    let rho = 10.75342009105268; // Chemical('nitrogen', P=(1E6+9E5)/2).rho
    let m1 = compressible.isothermal_gas( {rho: rho, fd: 0.00185, P1: 1E6, P2: 9E5, L: 1000., D: 0.5 });
    assert_close(m1, 141.92260633059334);

    // They are fairly similar
    let fd = 0.00185;
    P1 = 1E6;
    let P2 = 9E5;
    let L = 1000;
    let D = 0.5;
    let T = 298.15;
    // from scipy.constants import R
    // from thermo import property_molar_to_mass, Chemical, pi, log
    let R = 296.8029514446658; // property_molar_to_mass(R, Chemical('nitrogen').MW)
    let m2 = (Math.PI**2/16*D**4/(R*T*(fd*L/D + 2*Math.log(P1/P2)))*(P1**2-P2**2))**0.5;
    assert_close(m2, 145.48786057477403);
})


test('test_P_isothermal_critical_flow', ()=> {
    let P2_max = compressible.P_isothermal_critical_flow( {P: 1E6, fd: 0.00185, L: 1000., D: 0.5 });
    assert_close(P2_max, 389699.7317645518);
})

