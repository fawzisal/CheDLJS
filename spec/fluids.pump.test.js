import * as pump from '../src/fluids.pump.js';
import { assert_close, assert_close1d } from '../src/fluids.test_helpers.js' ;
import { sum } from '../src/fluids.numerics_init.js' ;
import { hp } from '../src/fluids.constants.js' ;
import { flatten } from '../src/fluids.helpers.js' ;

test('test_Corripio_pump_efficiency', ()=> {
    let eta = pump.Corripio_pump_efficiency(461./15850.323);
    assert_close(eta, 0.7058888670951621);
})

test('test_Corripio_motor_efficiency', ()=> {
    let eta = pump.Corripio_motor_efficiency(137*745.7);
    assert_close(eta, 0.9128920875679222);
})


test('test_VFD_efficiency', ()=> {
    let eta = pump.VFD_efficiency({P: 10*hp});
    assert_close(eta, 0.96);

    eta = pump.VFD_efficiency({P: 100*hp, load: 0.5 });
    assert_close(eta, 0.96);

    // Lower bound, 3 hp; upper bound, 400 hp; 0.016 load bound
    let etas = [pump.VFD_efficiency({P: 1*hp}), pump.VFD_efficiency({P: 500*hp}), pump.VFD_efficiency({P: 8*hp, load: 0.01 })];
    assert_close1d(etas, [0.94, 0.97, 0.386]);

    let hp_sum = sum(pump.nema_sizes_hp);
    assert_close(hp_sum, 3356.333333333333);
    let W_sum = sum(pump.nema_sizes);
    assert_close(W_sum, 2502817.33565396);
})

test('test_motor_round_size', () => {
    let sizes = [.1*hp, .25*hp, 1E5, 3E5].map( i =>pump.motor_round_size(i) );
    let sizes_calc = [186.42496789556753, 186.42496789556753, 111854.98073734052, 335564.94221202156];
    assert_close1d(sizes, sizes_calc);

    expect(()=>pump.motor_round_size(1E100)).toThrow();


})
test('test_CSA_motor_efficiency', ()=> {
    let nema_high_P_calcs = [true, false].map(i =>
            [2,4,6].map(j =>
                pump.nema_high_P.map( k =>
                    pump.CSA_motor_efficiency({P: k*hp, high_efficiency: true, closed: i, poles: j })
                    )
                )
            );
    let nema_high_Ps = [0.77, 0.84, 0.855, 0.865, 0.885, 0.885, 0.885, 0.895, 0.902, 0.91, 0.91, 0.917, 0.917, 0.924, 0.93, 0.936, 0.936, 0.941, 0.95, 0.95, 0.954, 0.954, 0.855, 0.865, 0.865, 0.895, 0.895, 0.895, 0.895, 0.917, 0.917, 0.924, 0.93, 0.936, 0.936, 0.941, 0.945, 0.95, 0.954, 0.954, 0.954, 0.958, 0.962, 0.962, 0.825, 0.875, 0.885, 0.895, 0.895, 0.895, 0.895, 0.91, 0.91, 0.917, 0.917, 0.93, 0.93, 0.941, 0.941, 0.945, 0.945, 0.95, 0.95, 0.958, 0.958, 0.958, 0.77, 0.84, 0.855, 0.855, 0.865, 0.865, 0.865, 0.885, 0.895, 0.902, 0.91, 0.917, 0.917, 0.924, 0.93, 0.936, 0.936, 0.936, 0.941, 0.941, 0.95, 0.95, 0.855, 0.865, 0.865, 0.895, 0.895, 0.895, 0.895, 0.91, 0.917, 0.93, 0.93, 0.936, 0.941, 0.941, 0.945, 0.95, 0.95, 0.954, 0.954, 0.958, 0.958, 0.958, 0.825, 0.865, 0.875, 0.885, 0.895, 0.895, 0.895, 0.902, 0.917, 0.917, 0.924, 0.93, 0.936, 0.941, 0.941, 0.945, 0.945, 0.95, 0.95, 0.954, 0.954, 0.954];
    assert_close1d(flatten(nema_high_P_calcs), nema_high_Ps);

    let nema_min_P_calcs = [true, false].map( i =>
            [2,4,6, 8].map(j =>
                pump.nema_min_P.map( k =>
                    pump.CSA_motor_efficiency({P: k*hp, high_efficiency: false, closed: i, poles: j })
            ))
        );
    let nema_min_Ps = [0.755, 0.825, 0.84, 0.855, 0.855, 0.875, 0.875, 0.885, 0.895, 0.902, 0.902, 0.91, 0.91, 0.917, 0.924, 0.93, 0.93, 0.936, 0.945, 0.945, 0.95, 0.95, 0.954, 0.954, 0.954, 0.954, 0.954, 0.954, 0.825, 0.84, 0.84, 0.875, 0.875, 0.875, 0.875, 0.895, 0.895, 0.91, 0.91, 0.924, 0.924, 0.93, 0.93, 0.936, 0.941, 0.945, 0.945, 0.95, 0.95, 0.95, 0.95, 0.954, 0.954, 0.954, 0.954, 0.958, 0.8, 0.855, 0.865, 0.875, 0.875, 0.875, 0.875, 0.895, 0.895, 0.902, 0.902, 0.917, 0.917, 0.93, 0.93, 0.936, 0.936, 0.941, 0.941, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.74, 0.77, 0.825, 0.84, 0.84, 0.855, 0.855, 0.855, 0.885, 0.885, 0.895, 0.895, 0.91, 0.91, 0.917, 0.917, 0.93, 0.93, 0.936, 0.936, 0.941, 0.941, 0.945, 0.945, 0.945, 0.945, 0.945, 0.945, 0.755, 0.825, 0.84, 0.84, 0.84, 0.855, 0.855, 0.875, 0.885, 0.895, 0.902, 0.91, 0.91, 0.917, 0.924, 0.93, 0.93, 0.93, 0.936, 0.936, 0.945, 0.945, 0.945, 0.95, 0.95, 0.954, 0.958, 0.958, 0.825, 0.84, 0.84, 0.865, 0.865, 0.875, 0.875, 0.885, 0.895, 0.91, 0.91, 0.917, 0.924, 0.93, 0.93, 0.936, 0.941, 0.941, 0.945, 0.95, 0.95, 0.95, 0.954, 0.954, 0.954, 0.954, 0.958, 0.958, 0.8, 0.84, 0.855, 0.865, 0.865, 0.875, 0.875, 0.885, 0.902, 0.902, 0.91, 0.917, 0.924, 0.93, 0.93, 0.936, 0.936, 0.941, 0.941, 0.945, 0.945, 0.945, 0.954, 0.954, 0.954, 0.954, 0.954, 0.954, 0.74, 0.755, 0.855, 0.865, 0.865, 0.875, 0.875, 0.885, 0.895, 0.895, 0.902, 0.902, 0.91, 0.91, 0.917, 0.924, 0.936, 0.936, 0.936, 0.936, 0.936, 0.936, 0.945, 0.945, 0.945, 0.945, 0.945, 0.945];
    assert_close1d(flatten(nema_min_P_calcs), nema_min_Ps);
})

test('test_motor_efficiency_underloaded', ()=> {
    let full_efficiencies = [0.5, 2.5, 7, 12, 42, 90].map( P =>pump.motor_efficiency_underloaded({P: P*hp, load: .99}) );
    assert_close1d(full_efficiencies, [1, 1, 1, 1, 1, 1]);

    let low_efficiencies = [0.5, 2.5, 7, 12, 42, 90].map( P =>pump.motor_efficiency_underloaded({P: P*hp, load: .25}) );
    let low_ans = [0.6761088414400706, 0.7581996772085579, 0.8679397648030529, 0.9163243775499996, 0.9522559064662419, 0.9798906308690559];
    assert_close1d(low_efficiencies, low_ans);
})


test('test_specific_speed', ()=> {
    let nS = pump.specific_speed({Q: 0.0402, H: 100.0, n: 3550.0});
    assert_close(nS, 22.50823182748925);
})


test('test_specific_diameter', ()=> {
    let Ds = pump.specific_diameter( {Q: 0.1, H: 10., D: 0.1 });
    assert_close(Ds, 0.5623413251903491);
})


test('test_speed_synchronous', ()=> {
    let [s1, s2] = [pump.speed_synchronous({f: 50.0, poles: 12 }), pump.speed_synchronous({f: 60.0, phase: 1 })];
    assert_close1d([s1, s2], [1500, 3600]);
})


test('test_current_ideal', ()=> {
    let I = pump.current_ideal( {V: 120.0, P: 1E4, PF: 1.0, phase: 1 });
    assert_close(I, 83.33333333333333);

    I = pump.current_ideal( {V: 208, P: 1E4, PF: 1, phase: 3 });
    assert_close(I, 27.757224480270473);

    I = pump.current_ideal( {V: 208, P: 1E4, PF: 0.95, phase: 3 });
    assert_close(I,29.218131031863656);

    expect(()=>pump.current_ideal( {V: 208, P: 1E4, PF: 0.95, phase: 5 })).toThrow();


})
test('test_power_sources', ()=> {
    expect(sum(pump.electrical_plug_types.map((x)=>x.charCodeAt(0)))).toEqual(1001);
    expect(pump.electrical_plug_types.length).toEqual(14);

    expect(sum(pump.voltages_1_phase_residential)).toEqual(1262);
    expect(pump.voltages_1_phase_residential.length).toEqual(8);

    expect(sum(pump.voltages_3_phase)).toEqual(3800);
    expect(pump.voltages_3_phase.length).toEqual(13);

    expect(pump.residential_power_frequencies).toEqual([50, 60]);

    expect(sum( Object.values(pump.residential_power).map( i =>i.voltage ))).toEqual(42071);
    expect(sum( Object.values(pump.residential_power).map( i =>i.freq ))).toEqual(10530);
    expect(Object.keys(pump.residential_power).length).toEqual(203);

    let ca = pump.residential_power['ca'];
    expect([ca.voltage, ca.freq, ca.plugs]).toEqual([120, 60, ['A', 'B']]);

    expect(sum( Object.values(pump.industrial_power).map( i => i.voltage ? sum(i.voltage) : 0 ))).toEqual(82144);
    expect(sum( Object.values(pump.industrial_power).map( i =>i.freq ))).toEqual(10210);
    expect(Object.keys(pump.industrial_power).length).toEqual(197);

    ca = pump.industrial_power['ca'];
    expect([ca.voltage, ca.freq]).toEqual([[120, 208, 240, 480, 347, 600], 60]);
})


test('test_CountryPower', ()=> {
    let a = new pump.CountryPower( {plugs: ['C', 'F', 'M', 'N'], voltage: 230.0, freq: 50.0, country: "South Africa" });
    expect(a).toBeInstanceOf(pump.CountryPower);

    // files seems to be cutoff, no tests use below code
    new pump.CountryPower( {plugs: ['G',], voltage: 240, freq: 50, country: "Seychelles" });
    new pump.CountryPower( {plugs: ['C', 'F'], voltage: 230, freq: 50, country: "Armenia" });
    new pump.CountryPower( {plugs: ['D', 'G', 'J', 'K', 'L'], voltage: 230, freq: 50, country: "Maldives" });
})


