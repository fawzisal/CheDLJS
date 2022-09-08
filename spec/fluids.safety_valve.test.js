
import * as safety_valve from '../src/fluids.safety_valve.js' ;
import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js';
import { atm } from '../src/fluids.constants.js';
import { _KSH_Pa, _KSH_tempKs } from '../src/fluids.safety_valve.js';
import { sum } from '../src/fluids.numerics_init.js';

test('test_API520_round_size', () => {
    let A = safety_valve.API520_round_size(1E-4);
    assert_close(A, 0.00012645136);
    expect(safety_valve.API526_letters[safety_valve.API526_A.indexOf(safety_valve.API520_round_size(1E-4))]).toBe('E');
    expect(()=>safety_valve.API520_round_size(1)).toThrow(Error);
})
test('test_API520_C', () => {
    assert_close(safety_valve.API520_C(1.35), 0.02669419967057233)
    assert_close(safety_valve.API520_C(1.), 0.023945830445454768)
    // let C1, C2 = [safety_valve.API520_C(1.35), safety_valve.API520_C(1.)];
    // let Cs = [0.02669419967057233, 0.023945830445454768];
    // assert_close1d([C1, C2], Cs);

})
test('test_API520_F2', () => {
    let F2 = safety_valve.API520_F2({k: 1.8, P1: 1E6, P2: 7E5});
    assert_close(F2, 0.8600724121105563);

})
test('test_API520_Kv', () => {
    let Kv_calcs = [safety_valve.API520_Kv(100), safety_valve.API520_Kv(4525), safety_valve.API520_Kv(1E5)];
    let Kvs = [0.6157445891444229, 0.9639390032437682, 0.9973949303006829];
    assert_close1d(Kv_calcs, Kvs);

})
test('test_API520_N', () => {
    let KN = safety_valve.API520_N(1774700);
    assert_close(KN, 1);

})
test('test_API520_SH', () => {
    expect(()=>safety_valve.API520_SH({T1: 593+273.15, P1: 21E6})).toThrow(Error);
    expect(()=>safety_valve.API520_SH({T1: 1000, P1: 1066E3})).toThrow(Error);
    // Test under 15 psig sat case
    expect(safety_valve.API520_SH({T1: 320, P1: 5E4})).toEqual(1);

    let KSH_tot =  sum( _KSH_Pa.slice( 0,-1 ).map(
        P =>
            _KSH_tempKs.map(T =>
                safety_valve.API520_SH({T1: T, P1: P})
            )
        ));
    assert_close(229.93, KSH_tot);

})
test('test_API520_W', () => {
    let KW = [safety_valve.API520_W({Pset: 1E6, Pback: 3E5}), safety_valve.API520_W({Pset: 1E6, Pback: 1E5})];
    assert_close1d(KW, [0.9511471848008564, 1]);

})
test('test_API520_B', () => {
    let B_calc = [safety_valve.API520_B({Pset: 1E6, Pback: 3E5}), safety_valve.API520_B({Pset: 1E6, Pback: 5E5}), safety_valve.API520_B({Pset: 1E6, Pback: 5E5, overpressure: .16 }), safety_valve.API520_B({Pset: 1E6, Pback: 5E5, overpressure: .21 })];
    let Bs = [1, 0.7929945420944432, 0.94825439189912, 1];
    assert_close1d(B_calc, Bs);

    // Issue # 45
    expect(safety_valve.API520_B({Pset: 2*atm, Pback: 1.5*atm, overpressure: .21 })).toEqual(1);

    expect(()=>safety_valve.API520_B({Pset: 1E6, Pback: 5E5, overpressure: .17 })).toThrow(Error);
    expect(()=>safety_valve.API520_B({Pset: 1E6, Pback: 7E5, overpressure: .16 })).toThrow(Error);
        

})
test('test_API520_A_g', () => {
    let A1 = safety_valve.API520_A_g( {m: 24270/3600., T: 348., Z: 0.90, MW: 51., k: 1.11, P1: 670E3, Kb: 1.0, Kc: 1.0 });
    let A2 = safety_valve.API520_A_g( {m: 24270/3600., T: 348., Z: 0.90, MW: 51., k: 1.11, P1: 670E3, P2: 532E3, Kd: 0.975, Kb: 1.0, Kc: 1.0 });
    let As = [0.0036990460646834414, 0.004248358775943481];
    assert_close1d([A1, A2], As);

    let A = safety_valve.API520_A_steam( {m: 69615/3600., T: 592.5, P1: 12236E3, Kd: 0.975, Kb: 1.0, Kc: 1.0 });
    assert_close(A, 0.0011034712423692733);
})



