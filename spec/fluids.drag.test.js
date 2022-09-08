// import { drag.drag_sphere, drag.drag_sphere_methods, drag.v_terminal, drag.integrate_drag_sphere, drag.time_v_terminal_Stokes, drag_sphere_correlations } from '../src/fluids.drag.js';
import * as drag from '../src/fluids.drag.js';;
import { assert_close1d, assert_close } from '../src/fluids.test_helpers.js';

let close = assert_close1d;
let Cd, Cds, Cd_values;
test('test_Stokes', ()=>{
    Cd = drag.Stokes(0.1);
    assert_close(Cd, 240.0);

})
// All examples from [1]_, in a table of calculated values, matches.
test('test_Barati', ()=>{
    Cds = [drag.Barati(200.), drag.Barati(0.002)];
    close(Cds, [0.7682237950389874, 12008.864343802072]);
})
// All examples from [1]_, in a table of calculated values, matches.
test('test_Barati_high', ()=>{
    Cds = [200, 0.002, 1E6].map( i =>drag.Barati_high(i) );
    Cd_values = [0.7730544082789523, 12034.714777630921, 0.21254574397767056];
    close(Cds, Cd_values);
})
test('test_Rouse', ()=>{
    Cds = [200, 0.002].map( i =>drag.Rouse(i) );
    Cd_values = [0.6721320343559642, 12067.422039324994];
    close(Cds, Cd_values);
})
test('test_Engelund_Hansen', ()=>{
    Cds = [200, 0.002].map( i =>drag.Engelund_Hansen(i) );
    Cd_values = [1.62, 12001.5];
    close(Cds, Cd_values);
})
test('test_Clift_Gauvin', ()=>{
    Cds = [200, 0.002].map( i =>drag.Clift_Gauvin(i) );
    Cd_values = [0.7905400398000133, 12027.153270425813];
    close(Cds, Cd_values);
})
test('test_Morsi_Alexander', ()=>{
    Cds = [0.002, 0.5, 5., 50., 500., 25E2, 7.5E3, 1E5].map( i =>drag.Morsi_Alexander(i) );
    Cd_values = [12000.0, 49.511199999999995, 6.899784, 1.500032, 0.549948, 0.408848, 0.4048818666666667, 0.50301667];
    close(Cds, Cd_values);
})
test('test_Graf', ()=>{
    Cds = [200, 0.002].map( i =>drag.Graf(i) );
    Cd_values = [0.8520984424785725, 12007.237509093471];
    close(Cds, Cd_values);
})
test('test_Flemmer_Banks', ()=>{
    Cds = [200, 0.002].map( i =>drag.Flemmer_Banks(i) );
    Cd_values = [0.7849169609270039, 12194.582998088363];
    close(Cds, Cd_values);
})
test('test_Khan_Richardson', ()=>{
    Cds = [200, 0.002].map( i =>drag.Khan_Richardson(i) );
    Cd_values = [0.7747572379211097, 12335.279663284822];
    close(Cds, Cd_values);
})
test('test_Swamee_Ojha', ()=>{
    Cds = [200, 0.002].map( i =>drag.Swamee_Ojha(i) );
    Cd_values = [0.8490012397545713, 12006.510258198376];
    close(Cds, Cd_values);
})
test('test_Yen', ()=>{
    Cds = [200, 0.002].map( i =>drag.Yen(i) );
    Cd_values = [0.7822647002187014, 12080.906446259793];
    close(Cds, Cd_values);
})
test('test_Haider_Levenspiel', ()=>{
    Cds = [200, 0.002].map( i =>drag.Haider_Levenspiel(i) );
    Cd_values = [0.7959551680251666, 12039.14121183969];
    close(Cds, Cd_values);
})
test('test_Cheng', ()=>{
    Cds = [200, 0.002].map( i =>drag.Cheng(i) );
    Cd_values = [0.7939143028294227, 12002.787740305668];
    close(Cds, Cd_values);
})
test('test_Terfous', ()=>{
    Cds = [200].map( i =>drag.Terfous(i) );
    Cd_values = [0.7814651149769638];
    close(Cds, Cd_values);
})
test('test_Mikhailov_Freire', ()=>{
    Cds = [200, 0.002].map( i =>drag.Mikhailov_Freire(i) );
    Cd_values = [0.7514111388018659, 12132.189886046555];
    close(Cds, Cd_values);
})
test('test_Clift', ()=>{
    Cds = [0.002, 0.5, 50., 500., 2500., 40000, 75000., 340000, 5E5].map( i =>drag.Clift(i) );
    Cd_values = [12000.1875, 51.538273834491875, 1.5742657203722197, 0.5549240285782678, 0.40817983162668914, 0.4639066546786017, 0.49399935325210037, 0.4631617396760497, 0.5928043008238435];
    close(Cds, Cd_values);
})
test('test_Ceylan', ()=>{
    Cds = [200].map( i =>drag.Ceylan(i) );
    Cd_values = [0.7816735980280175];
    close(Cds, Cd_values);
})
test('test_Almedeij', ()=>{
    Cds = [200, 0.002].map( i =>drag.Almedeij(i) );
    Cd_values = [0.7114768646813396, 12000.000000391443];
    close(Cds, Cd_values);
})
test('test_Morrison', ()=>{
    Cds = [200, 0.002].map( i =>drag.Morrison(i) );
    Cd_values = [0.767731559965325, 12000.134917101897];
    close(Cds, Cd_values);
})
test('test_Song_Xu', ()=>{
    Cd = drag.Song_Xu({Re: 1.72525554724508000000});
    assert_close(Cd, 17.1249219416881000000);

    Cd = drag.Song_Xu({Re: 1.24798925062065, sphericity: 0.64, S: 0.55325984525397 });
    assert_close(Cd, 36.00464629658840);
})
test('test_drag_sphere', ()=>{
    for( let k of Object.keys(drag.drag_sphere_correlations) ) {
        drag.drag_sphere({Re: 1e6, Method: k });
    }
    let Cd = drag.drag_sphere({Re: 200});
    assert_close(Cd, 0.7682237950389874);

    Cd = drag.drag_sphere({Re: 1E6});
    assert_close(Cd, 0.21254574397767056);

    Cd = drag.drag_sphere({Re: 1E6, Method: 'Barati_high' });
    assert_close(Cd, 0.21254574397767056);

    Cd = drag.drag_sphere({Re: 0.001});
    assert_close(Cd, 24000.0);

    Cd = drag.drag_sphere({Re: 0.05});
    assert_close(Cd, 481.23769162684573);

    expect(()=>{drag.drag_sphere({Re: 200, Method: 'BADMETHOD' });}).toThrow()

    expect(()=>{drag.drag_sphere({Re: 1E7});}).toThrow()


})
test('test_drag_sphere_methods', ()=>{

    let methods = drag.drag_sphere_methods({Re: 3E5, check_ranges: true});
    let method_known = ['Barati_high', 'Ceylan', 'Morrison', 'Clift', 'Almedeij'];
    expect(method_known.sort()).toEqual(methods.sort());
    expect(drag.drag_sphere_methods({Re: 200}).length).toEqual(20);
    expect(drag.drag_sphere_methods({Re: 200000, check_ranges: false }).length).toEqual(21);
    expect(drag.drag_sphere_methods({Re: 200000, check_ranges: true }).length).toEqual(5);
})

test('test_v_terminal', ()=>{
    let v_t = drag.v_terminal( {D: 70E-6, rhop: 2600., rho: 1000., mu: 1E-3 });
    assert_close(v_t, 0.00414249724453);

    v_t = drag.v_terminal( {D: 70E-9, rhop: 2600., rho: 1000., mu: 1E-3 });
    assert_close(v_t, 4.271340888888889e-09);

    // [2] has a good example
    v_t = drag.v_terminal( {D: 70E-6, rhop: 2.6E3, rho: 1000., mu: 1E-3 });
    assert_close(v_t, 0.004142497244531304);
    // vs 0.00406 by [2], with the Oseen correlation not implemented here
    // It also has another example
    v_t = drag.v_terminal( {D: 50E-6, rhop: 2.8E3, rho: 1000., mu: 1E-3 });
    assert_close(v_t, 0.0024195143465496655);
    // vs 0.002453 in [2]

    // Laminar example
    v_t = drag.v_terminal( {D: 70E-6, rhop: 2600., rho: 1000., mu: 1E-1 });
    assert_close(v_t, 4.271340888888888e-05);

    v_t = drag.v_terminal( {D: 70E-6, rhop: 2600., rho: 1000., mu: 1E-3, Method: 'drag.Rouse' });
    assert_close(v_t, 0.003991779430745852);
})

// @pytest.mark.scipy
test('test_integrate_drag_sphere', ()=>{
    let ans = drag.integrate_drag_sphere( {D: 0.001, rhop: 2200., rho: 1.2, mu: 1.78E-5, t: 0.5, V: 30.0, distance: true });
    assert_close1d(ans, [9.686465044063436, 7.829454643649386]);

    ans = drag.integrate_drag_sphere( {D: 0.001, rhop: 2200., rho: 1.2, mu: 1.78E-5, t: 0.5, V: 30.0 });
    assert_close(ans, 9.686465044063436);

    // Check no error when V is zero


    ans = drag.integrate_drag_sphere( {D: 0.001, rhop: 1.20001, rho: 1.2, mu: 1.78E-5, t: 0.5, V: 0.0 });
    assert_close(ans, 3.0607521920092645e-07);

    // drag.Stokes law regime integration
    ans = drag.integrate_drag_sphere( {D: 0.001, rhop: 2200., rho: 1.2, mu: 1.78E-5, t: 0.1, V: 0, distance: true, Method: 'drag.Stokes' });
    assert_close1d(ans, [0.9730274844308592, 0.04876946395795378]);

    ans = drag.integrate_drag_sphere( {D: 0.001, rhop: 2200., rho: 1.2, mu: 1.78E-5, t: 0.1, V: 10, distance: true, Method: 'drag.Stokes' });
    assert_close1d(ans, [10.828446488771524, 1.041522867361668]);

    ans = drag.integrate_drag_sphere( {D: 0.001, rhop: 2200., rho: 1.2, mu: 1.78E-5, t: 0.1, V: -10, distance: true, Method: 'drag.Stokes' });
    assert_close1d(ans, [-8.882391519909806, -0.9439839394457605]);

    // drag.Stokes law regime - test case where particle is ensured to be laminar before and after the simulation
    for( let m of [null, 'drag.Stokes'] ) {
        ans = drag.integrate_drag_sphere( {D: 0.000001, rhop: 2200., rho: 1.2, mu: 1.78E-5, t: 0.1, V: 0, distance: true, Method: m });
        assert_close1d(ans, [6.729981897140177e-05, 6.729519788530099e-06], { rtol: 1e-11 });
    }

})
test('test_time_v_terminal_Stokes', ()=>{
    let t = drag.time_v_terminal_Stokes( {D: 1e-7, rhop: 2200., rho: 1.2, mu: 1.78E-5, V0: 1.0 });
    assert_close(t, 3.188003113787154e-06);

    // Very slow - many iterations
    t = drag.time_v_terminal_Stokes( {D: 1e-2, rhop: 2200., rho: 1.2, mu: 1.78E-5, V0: 1.0, tol: 1e-30 });
    assert_close(t, 24800.636391802);
})

