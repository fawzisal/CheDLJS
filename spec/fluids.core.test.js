import * as core from '../src/fluids.core.js';
import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js';
import { mkArray } from '../src/fluids.numerics_init.js';

describe('test_core_misc', () => {
    test('test_thermal_diffusivity', () => {
        let alpha = core.thermal_diffusivity({k: 0.02, rho: 1., Cp: 1000.});
        assert_close(alpha, 2e-05);
    })
    test('test_c_ideal_gas', () => {
        let c = core.c_ideal_gas({T: 1.4, k: 303., MW: 28.96});
        assert_close(c, 348.9820361755092);
    })
})
describe('test_dimensionless_numbers', ()=>{

    test('test_Reynolds', () => {
        let Re = core.Reynolds({V: 2.5, D: 0.25, rho: 1.1613, mu: 1.9E-5});
        assert_close(Re, 38200.65789473684);
        Re = core.Reynolds({V: 2.5, D: 0.25, nu: 1.636e-05 });
        assert_close(Re, 38202.93398533008);
        expect(()=>{core.Reynolds({V: 2.5, D: 0.25, rho: 1.1613});}).toThrow()
    })
    test('test_Peclet_heat', () => {
        let PeH = core.Peclet_heat({V: 1.5, L: 2, rho: 1000., Cp: 4000., k: 0.6});
        assert_close(PeH, 20000000.0);
        PeH = core.Peclet_heat({V: 1.5, L: 2., alpha: 1E-7 });
        assert_close(PeH, 30000000.0);
        expect(()=>{core.Peclet_heat({V: 1.5, L: 2, rho: 1000., Cp: 4000.});}).toThrow()
    })
    test('test_Peclet_mass', () => {
        let PeM = core.Peclet_mass({V: 1.5, L: 2., D: 1E-9});
        assert_close(PeM, 3000000000);
    })
    test('test_Fourier_heat', () => {
        let FH1 = core.Fourier_heat({t: 1.5, L: 2., rho: 1000., Cp: 4000., k: 0.6});
        let FH2 = core.Fourier_heat({t: 1.5, L: 2, alpha: 1E-7 });
        assert_close1d([FH1, FH2], [5.625e-08, 3.75e-08]);
        expect(()=>{core.Fourier_heat({t: 1.5, L: 2, rho: 1000., Cp: 4000.});}).toThrow()
    })
    test('test_Fourier_mass', () => {
        let FHM = core.Fourier_mass({t: 1.5, L: 2.0, D: 1E-9});
        assert_close(FHM,  3.7500000000000005e-10);
    })
    test('test_Graetz_heat', () => {
        let GZh1 = core.Graetz_heat({V: 1.5, D: 0.25, x: 5., rho: 800., Cp: 2200., k: 0.6});
        let GZh2 = core.Graetz_heat({V: 1.5, D: 0.25, x: 5, alpha: 1E-7 });
        assert_close1d([GZh1, GZh2], [55000.0, 187500.0]);
        expect(()=>{core.Graetz_heat({V: 1.5, D: 0.25, x: 5, rho: 800., Cp: 2200.});}).toThrow()
    })
    test('test_Schmidt', () => {
        let Sc1 = core.Schmidt( {D: 2E-6, mu: 4.61E-6, rho: 800. });
        let Sc2 = core.Schmidt( {D: 1E-9, nu: 6E-7 });
        assert_close1d([Sc1, Sc2], [0.00288125, 600.]);
        expect(()=>{core.Schmidt( {D: 2E-6, mu: 4.61E-6 });}).toThrow()
    })
    test('test_Lewis', () => {
        let Le1 = core.Lewis( {D: 22.6E-6, alpha: 19.1E-6 });
        let Le2 = core.Lewis( {D: 22.6E-6, rho: 800., k: .2, Cp: 2200. });
        assert_close1d([Le1, Le2], [0.8451327433628318, 0.00502815768302494]);
        expect(()=>{core.Lewis( {D: 22.6E-6, rho: 800., k: .2 });}).toThrow()
    })
    test('test_Weber', () => {
        let We = core.Weber({V: 0.18, L: 0.001, rho: 900., sigma: 0.01});
        assert_close(We, 2.916);
    })
    test('test_Mach', () => {
        let Ma = core.Mach({V: 33., c: 330.});
        assert_close(Ma, 0.1);
    })
    test('test_Knudsen', () => {
        let Kn = core.Knudsen({path: 1e-10, L: .001});
        assert_close(Kn, 1e-07);
    })
    test('test_Prandtl', () => {
        let Pr1 = core.Prandtl( {Cp: 1637., k: 0.010, mu: 4.61E-6 });
        let Pr2 = core.Prandtl( {Cp: 1637., k: 0.010, nu: 6.4E-7, rho: 7.1 });
        let Pr3 = core.Prandtl( {nu: 6.3E-7, alpha: 9E-7 });
        assert_close1d([Pr1, Pr2, Pr3], [0.754657, 0.7438528, 0.7]);
        expect(()=>{core.Prandtl( {Cp: 1637., k: 0.010 });}).toThrow()
    })
    test('test_Grashof', () => {
        let Gr1 = core.Grashof( {L: 0.9144, beta: 0.000933, T1: 178.2, rho: 1.1613, mu: 1.9E-5 });
        let Gr2 = core.Grashof( {L: 0.9144, beta: 0.000933, T1: 378.2, T2: 200., nu: 1.636e-05 });
        assert_close1d([Gr1, Gr2], [4656936556.178915, 4657491516.530312]);
        expect(()=>{core.Grashof( {L: 0.9144, beta: 0.000933, T1: 178.2, rho: 1.1613 });}).toThrow()
    })
    test('test_Bond', () => {
        let Bo1 = core.Bond({rhol: 1000., rhog: 1.2, sigma: .0589, L: 2.});
        assert_close(Bo1, 665187.2339558573);
    })
    test('test_Rayleigh', () => {
        let Ra1 = core.Rayleigh({Pr: 1.2, Gr: 4.6E9});
        assert_close(Ra1, 5520000000);
    })
    test('test_Froude', () => {
        let Fr1 = core.Froude({V: 1.83, L: 2., g: 1.63});
        let Fr2 = core.Froude({V: 1.83, L: 2., squared: true });
        assert_close1d([Fr1, Fr2], [1.0135432593877318, 0.17074638128208924]);
    })
    test('test_Strouhal', () => {
        let St = core.Strouhal({f: 8., L: 2., V: 4.});
        assert_close(St, 4.0);
    })
    test('test_Nusselt', () => {
        let Nu1 = core.Nusselt({h: 1000., L: 1.2, k: 300.});
        let Nu2 = core.Nusselt({h: 10000., L: .01, k: 4000.});
        assert_close1d([Nu1, Nu2], [4.0, 0.025]);
    })
    test('test_Sherwood', () => {
        let Sh = core.Sherwood({K: 1000., L: 1.2, D: 300.});
        assert_close(Sh, 4.0);
    })
    test('test_Biot', () => {
        let Bi1 = core.Biot({h: 1000., L: 1.2, k: 300.});
        let Bi2 = core.Biot({h: 10000., L: .01, k: 4000.});
        assert_close1d([Bi1, Bi2], [4.0, 0.025]);
    })
    test('test_Stanton', () => {
        let St1 = core.Stanton({h: 5000., V: 5., rho: 800., Cp: 2000.});
        assert_close(St1, 0.000625);
    })
    test('test_Euler', () => {
        let Eu1 = core.Euler({dP: 1E5, rho: 1000., V: 4.});
        assert_close(Eu1, 6.25);
    })
    test('test_Cavitation', () => {
        let Ca1 = core.Cavitation({P: 2E5, Psat: 1E4, rho: 1000., V: 10.});
        assert_close(Ca1, 3.8);
    })
    test('test_Eckert', () => {
        let Ec1 = core.Eckert({V: 10., Cp: 2000., dT: 25.});
        assert_close(Ec1, 0.002);
    })
    test('test_Jakob', () => {
        let Ja1 = core.Jakob({Cp: 4000., Hvap: 2E6, Te: 10.});
        assert_close(Ja1, 0.02);
    })
    test('test_Power_number', () => {
        let Po1 = core.Power_number( {P: 180., L: 0.01, N: 2.5, rho: 800. });
        assert_close(Po1, 144000000);
    })
    test('test_Drag', () => {
        let Cd1 = core.Drag({F: 1000., A: 0.0001, V: 5., rho: 2000.});
        assert_close(Cd1, 400);
    })
    test('test_Capillary', () => {
        let Ca1 = core.Capillary({V: 1.2, mu: 0.01, sigma: .1});
        assert_close(Ca1, 0.12);
    })
    test('test_Archimedes', () => {
        let Ar1 = core.Archimedes({L: 0.002, rhof: 0.2804, rhop: 2699.37, mu: 4E-5});
        let Ar2 = core.Archimedes({L: 0.002, rhof: 2., rhop: 3000., mu: 1E-3});
        assert_close1d([Ar1, Ar2], [37109.575890227665, 470.4053872]);
    })
    test('test_Ohnesorge', () => {
        let Oh1 = core.Ohnesorge({L: 1E-4, rho: 1000., mu: 1E-3, sigma: 1E-1});
        assert_close(Oh1, 0.01);
    })
    test('test_Suratman', () => {
        let Su = core.Suratman({L: 1E-4, rho: 1000., mu: 1E-3, sigma: 1E-1});
        assert_close(Su, 10000.0);
    })
    test('test_Bejan_L', () => {
        let BeL1 = core.Bejan_L({dP: 1E4, L: 1., mu: 1E-3, alpha: 1E-6});
        assert_close(BeL1, 10000000000000);
    })
    test('test_Bejan_p', () => {
        let Bep1 = core.Bejan_p({dP: 1E4, K: 1., mu: 1E-3, alpha: 1E-6});
        assert_close(Bep1, 10000000000000);
    })
    test('test_Boiling', () => {
        let Bo = core.Boiling({G: 300., q: 3000., Hvap: 800000.});
        assert_close(Bo, 1.25e-05);
    })
    test('test_relative_roughness', () => {
        let e_D1 = core.relative_roughness({D: 0.0254});
        let e_D2 = core.relative_roughness({D: 0.5, roughness: 1E-4});
        assert_close1d([e_D1, e_D2], [5.9842519685039374e-05, 0.0002]);
    })
    test('test_Confinement', () => {
        let Co = core.Confinement({D: 0.001, rhol: 1077, rhog: 76.5, sigma: 4.27E-3});
        assert_close(Co, 0.6596978265315191);
    })
    test('test_Dean', () => {
        let De = core.Dean({Re: 10000., Di: 0.1, D: 0.4});
        assert_close(De, 5000.0);
    })
    test('test_Stokes_number', () => {
        let Stk = core.Stokes_number( {V: 0.9, Dp: 1E-5, D: 1E-3, rhop: 1000., mu: 1E-5 });
        assert_close(Stk, 0.5);
    })
    test('test_Hagen', () => {
        let Hg = core.Hagen( {Re: 2610., fd: 1.935235 });
        assert_close(Hg, 6591507.17175);
        function Hagen2({rho, D, mu}) { return rho*D**3/mu**2; }
        let correct = Hagen2( {rho: 992., mu: 653E-6, D: 6.568E-3 })*10000;

        let guess = core.Hagen( {Re: 2610., fd: 1.935235 });
        assert_close(correct, guess);
    })
    test('test_Froude_densimetric', () => {
        let Fr = core.Froude_densimetric({V: 1.83, L: 2., rho2: 1.2, rho1: 800., g: 9.81 });
        assert_close(Fr, 0.4134543386272418);
        Fr = core.Froude_densimetric({V: 1.83, L: 2., rho2: 1.2, rho1: 800, g: 9.81, heavy: false });
        assert_close(Fr, 0.016013017679205096);
    })
    test('test_Morton', () => {
        let Mo = core.Morton({rhol: 1077.0, rhog: 76.5, mul: 4.27E-3, sigma: 0.023});
        assert_close(Mo, 2.311183104430743e-07);
    })

})

describe('test_core_misc2', () => {
    test('test_nu_mu_converter', () => {
        let mu1 = core.nu_mu_converter({rho: 998., nu: 1.0E-6 });
        let nu1 = core.nu_mu_converter({rho: 998., mu: 0.000998 });
        assert_close1d([mu1, nu1], [0.000998, 1E-6]);
        expect(()=>{core.nu_mu_converter({rho: 990});}).toThrow()
        expect(()=>{core.nu_mu_converter({rho: 990, mu: 0.000998, nu: 1E-6});}).toThrow()
    })
    test('test_gravity', () => {
        let g1 = core.gravity({latitude: 55., H: 1E4});
        assert_close(g1, 9.784151976863571);
    })
    test('test_K_from_f', () => {
        let K = core.K_from_f( {fd: 0.018, L: 100., D: .3 });
        assert_close(K, 6.0);
    })
    test('test_K_from_L_equiv', () => {
        let K = core.K_from_L_equiv({L_D: 240.});
        assert_close(K, 3.6);
    })
    test('test_L_equiv_from_K', () => {
        let L_D = core.L_equiv_from_K({K: 3.6});
        assert_close(L_D, 240.);
    })
    test('test_L_from_K', () => {
        let L = core.L_from_K( {K: 6., fd: 0.018, D: .3 });
        assert_close(L, 100);
    })
    test('test_dP_from_K', () => {
        let dP = core.dP_from_K( {K: 10., rho: 1000., V: 3. });
        assert_close(dP, 45000);
    })
    test('test_head_from_K', () => {
        let head = core.head_from_K( {K: 10., V: 1.5 });
        assert_close(head, 1.1471807396001694);
    })
    test('test_head_from_P', () => {
        let head = core.head_from_P( {P: 98066.5, rho: 1000. });
        assert_close(head, 10.0);
    })
    test('test_P_from_head', () => {
        let P = core.P_from_head( {head: 5., rho: 800. });
        assert_close(P, 39226.6);
    })
    test('test_f_from_K', () => {
        let fd = core.f_from_K( {K: 0.6, L: 100., D: .3 });
        assert_close(fd, 0.0018);
    })
})



//from fluids.core import core.C2K, core.K2C, core.F2C, core.C2F, core.F2K, core.K2F, core.C2R, core.K2R, core.F2R, core.R2C, core.R2K, core.R2F

// The following are tests which were deprecated from scipy
// but are still desired to be here
// Taken from scipy/constants/constants.py as in commit
// https://github.com/scipy/scipy/commit/4b7d325cd50e8828b06d628e69426a18283dc5b5
// Also from https://github.com/scipy/scipy/pull/5292
// by Gillu13  (Gilles Aouizerate)
// Copyright individual contributors to SciPy


describe('test_temperature_conversions', () => {
    test('test_fahrenheit_to_celcius', () => {
        assert_close(core.F2C(32.), 0);
        assert_close1d([core.F2C(32)], [0]);
    })
    test('test_celcius_to_kelvin', () => {
        assert_close1d([core.C2K(0.)], [273.15]);
    })
    test('test_kelvin_to_celcius', () => {
        assert_close1d([core.K2C(0.)], [-273.15]);
    })
    test('test_fahrenheit_to_kelvin', () => {
        assert_close1d([core.F2K(32.), core.F2K(32)], [273.15, 273.15]);
    })
    test('test_kelvin_to_fahrenheit', () => {
        assert_close1d([core.K2F(273.15), core.K2F(273.15)], [32, 32]);
    })
    test('test_celcius_to_fahrenheit', () => {
        assert_close1d(mkArray(core.C2F(0.), 2), [32, 32]);
    })
    test('test_celcius_to_rankine', () => {
        assert_close1d([core.C2R(0.), core.C2R(0.)], [491.67, 491.67]);
    })
    test('test_kelvin_to_rankine', () => {
        assert_close1d([core.K2R(273.15), core.K2R(273.15)], [491.67, 491.67]);
    })
    test('test_fahrenheit_to_rankine', () => {
        assert_close1d([core.F2R(32.), core.F2R(32.)], [491.67, 491.67]);
    })
    test('test_rankine_to_fahrenheit', () => {
        assert_close1d([core.R2F(491.67), core.R2F(491.67)], [32., 32.]);
    })
    test('test_rankine_to_celcius', () => {
        assert_close1d([core.R2C(491.67), core.R2C(491.67)], [0., 0.]);
    })
    test('test_rankine_to_kelvin', () => {
        assert_close1d([core.R2K(491.67), core.R2K(0.)], [273.15, 0.]);
    })
})



