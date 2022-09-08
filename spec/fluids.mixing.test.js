import * as mixing from '../src/fluids.mixing.js' ;

import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js' ;
test( 'test_mixing', () => {
    let t1 = mixing.agitator_time_homogeneous( {D: 36*.0254, N: 56/60., P: 957., T: 1.83, H: 1.83, mu: 0.018, rho: 1020.0, homogeneity: .995 });
    let t2 = mixing.agitator_time_homogeneous( {D: 1, N: 125/60., P: 298., T: 3, H: 2.5, mu: .5, rho: 980, homogeneity: .95 });
    let t3 = mixing.agitator_time_homogeneous( {N: 125/60., P: 298., T: 3, H: 2.5, mu: .5, rho: 980, homogeneity: .95 });

    assert_close1d([t1, t2, t3], [15.143198226374668, 67.7575069865228, 51.70865552491966]);

    let Kp = mixing.Kp_helical_ribbon_Rieger( {D: 1.9, h: 1.9, nb: 2, pitch: 1.9, width: .19, T: 2.0 });
    assert_close(Kp, 357.39749163259256);

    let t = mixing.time_helical_ribbon_Grenville({Kp: 357.4, N: 4/60.});
    assert_close(t, 650.980654028894);

    let CoV = mixing.size_tee( {Q1: 11.7, Q2: 2.74, D: 0.762, D2: null, n: 1, pipe_diameters: 5.0 });
    assert_close(CoV, 0.2940930233038544);

    CoV = mixing.COV_motionless_mixer( {Ki: .33, Q1: 11.7, Q2: 2.74, pipe_diameters: 4.74/.762 });
    assert_close(CoV, 0.0020900028665727685);

    let K = mixing.K_motionless_mixer( {K: 150.0, L: .762*5, D: .762, fd: .01 });
    assert_close(K, 7.5);
})


