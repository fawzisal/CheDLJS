
let __all__ = ['ParticleSizeDistribution', 'ParticleSizeDistributionContinuous',
           'PSDLognormal', 'PSDGatesGaudinSchuhman', 'PSDRosinRammler',
           'PSDInterpolated', 'PSDCustom',
           'psd_spacing',

           'pdf_lognormal', 'cdf_lognormal', 'pdf_lognormal_basis_integral',

           'pdf_Gates_Gaudin_Schuhman', 'cdf_Gates_Gaudin_Schuhman',
           'pdf_Gates_Gaudin_Schuhman_basis_integral',

           'pdf_Rosin_Rammler', 'cdf_Rosin_Rammler',
           'pdf_Rosin_Rammler_basis_integral',

           'ASTM_E11_sieves', 'ISO_3310_1_sieves', 'Sieve',
           'ISO_3310_1_R20_3', 'ISO_3310_1_R20', 'ISO_3310_1_R10',
           'ISO_3310_1_R40_3'];
import { brenth, epsilon, gammaincc, linspace, logspace, cumsum, diff, normalize, quad } from './fluids.numerics_init.js' ;
import { gamma, erf } from 'mathjs';
import { listZip, stringInterpolate, hasAttr } from './_pyjs.js';

ROOT_TWO_PI = Math.sqrt(2.0*Math.PI);

NO_MATPLOTLIB_MSG = 'Optional dependency matplotlib is required for plotting';
 class Sieve extends object {
    __slots__ = ('designation', 'old_designation', 'opening', 'opening_inch',
                 'Y_variation_avg', 'X_variation_max', 'max_opening',
                 'calibration_samples', 'compliance_sd', 'inspection_samples',
                 'inspection_sd', 'calibration_samples', 'calibration_sd',
                 'd_wire', 'd_wire_min', 'd_wire_max', 'compliance_samples');
    toString() {
        return stringInterpolate( '<Sieve, designation %s mm, opening %g m>',[this.designation, this.opening] );
    }

    constructor( designation, old_designation=null, opening=null,
                 opening_inch=null, Y_variation_avg=null, X_variation_max=null,
                 max_opening=null, compliance_samples=null, compliance_sd=null,
                 inspection_samples=null, inspection_sd=null, calibration_samples=null,
                 calibration_sd=null, d_wire=null, d_wire_min=null, d_wire_max=null) {

        this.designation = designation;
        this.old_designation = old_designation;
        this.opening_inch = opening_inch;
        this.opening = opening;

        this.Y_variation_avg = Y_variation_avg;
        this.X_variation_max = X_variation_max;
        this.max_opening = max_opening;

        this.compliance_samples = compliance_samples;
        this.compliance_sd = compliance_sd;

        this.inspection_samples = inspection_samples;
        this.inspection_sd = inspection_sd;

        this.calibration_samples = calibration_samples;
        this.calibration_sd = calibration_sd;

        this.d_wire = d_wire;
        this.d_wire_min = d_wire_min;
        this.d_wire_max = d_wire_max;
    }


}
ASTM_E11_sieves = {'0.02': Sieve(calibration_samples=300.0, d_wire_min=2e-08, d_wire=2e-08, inspection_sd=4.51, calibration_sd=4.75, old_designation='No. 635', opening=2e-05, compliance_samples=1000.0, opening_inch=8e-07, inspection_samples=100.0, designation='0.02', d_wire_max=2e-08, max_opening=0.035, X_variation_max=1.5e-05, Y_variation_avg=2.3e-06, compliance_sd=5.33),
 '0.025': Sieve(calibration_samples=300.0, d_wire_min=2e-08, d_wire=3e-08, inspection_sd=4.82, calibration_sd=5.06, old_designation='No. 500', opening=2.5e-05, compliance_samples=1000.0, opening_inch=1e-06, inspection_samples=100.0, designation='0.025', d_wire_max=3e-08, max_opening=0.041, X_variation_max=1.6e-05, Y_variation_avg=2.5e-06, compliance_sd=5.71),
 '0.032': Sieve(calibration_samples=300.0, d_wire_min=2e-08, d_wire=3e-08, inspection_sd=5.42, calibration_sd=5.71, old_designation='No. 450', opening=3.2e-05, compliance_samples=1000.0, opening_inch=1.2e-06, inspection_samples=100.0, designation='0.032', d_wire_max=3e-08, max_opening=0.05, X_variation_max=1.8e-05, Y_variation_avg=2.7e-06, compliance_sd=6.42),
 '0.038': Sieve(calibration_samples=300.0, d_wire_min=2e-08, d_wire=3e-08, inspection_sd=5.99, calibration_sd=6.31, old_designation='No. 400', opening=3.8e-05, compliance_samples=1000.0, opening_inch=1.5e-06, inspection_samples=100.0, designation='0.038', d_wire_max=3e-08, max_opening=0.058, X_variation_max=2e-05, Y_variation_avg=2.9e-06, compliance_sd=7.09),
 '0.045': Sieve(calibration_samples=250.0, d_wire_min=3e-08, d_wire=3e-08, inspection_sd=6.56, calibration_sd=6.84, old_designation='No. 325', opening=4.5e-05, compliance_samples=1000.0, opening_inch=1.7e-06, inspection_samples=100.0, designation='0.045', d_wire_max=4e-08, max_opening=0.067, X_variation_max=2.2e-05, Y_variation_avg=3.1e-06, compliance_sd=7.76),
 '0.053': Sieve(calibration_samples=250.0, d_wire_min=3e-08, d_wire=4e-08, inspection_sd=7.13, calibration_sd=7.44, old_designation='No. 270', opening=5.3e-05, compliance_samples=1000.0, opening_inch=2.1e-06, inspection_samples=100.0, designation='0.053', d_wire_max=4e-08, max_opening=0.077, X_variation_max=2.4e-05, Y_variation_avg=3.4e-06, compliance_sd=8.44),
 '0.063': Sieve(calibration_samples=250.0, d_wire_min=4e-08, d_wire=5e-08, inspection_sd=7.76, calibration_sd=8.09, old_designation='No. 230', opening=6.3e-05, compliance_samples=1000.0, opening_inch=2.5e-06, inspection_samples=100.0, designation='0.063', d_wire_max=5e-08, max_opening=0.089, X_variation_max=2.6e-05, Y_variation_avg=3.7e-06, compliance_sd=9.18),
 '0.075': Sieve(calibration_samples=250.0, d_wire_min=4e-08, d_wire=5e-08, inspection_sd=8.64, calibration_sd=9.02, old_designation='No. 200', opening=7.5e-05, compliance_samples=1000.0, opening_inch=2.9e-06, inspection_samples=100.0, designation='0.075', d_wire_max=6e-08, max_opening=0.104, X_variation_max=2.9e-05, Y_variation_avg=4.1e-06, compliance_sd=10.23),
 '0.09': Sieve(calibration_samples=200.0, d_wire_min=5e-08, d_wire=6e-08, inspection_sd=9.53, calibration_sd=9.8, old_designation='No. 170', opening=9e-05, compliance_samples=1000.0, opening_inch=3.5e-06, inspection_samples=100.0, designation='0.09', d_wire_max=7e-08, max_opening=0.122, X_variation_max=3.2e-05, Y_variation_avg=4.6e-06, compliance_sd=11.27),
 '0.106': Sieve(calibration_samples=200.0, d_wire_min=6e-08, d_wire=7e-08, inspection_sd=10.47, calibration_sd=10.77, old_designation='No. 140', opening=0.000106, compliance_samples=1000.0, opening_inch=4.1e-06, inspection_samples=100.0, designation='0.106', d_wire_max=8e-08, max_opening=0.141, X_variation_max=3.5e-05, Y_variation_avg=5.2e-06, compliance_sd=12.39),
 '0.125': Sieve(calibration_samples=200.0, d_wire_min=8e-08, d_wire=9e-08, inspection_sd=11.41, calibration_sd=11.74, old_designation='No. 120', opening=0.000125, compliance_samples=1000.0, opening_inch=4.9e-06, inspection_samples=100.0, designation='0.125', d_wire_max=1e-07, max_opening=0.163, X_variation_max=3.8e-05, Y_variation_avg=5.8e-06, compliance_sd=13.51),
 '0.15': Sieve(calibration_samples=200.0, d_wire_min=9e-08, d_wire=1e-07, inspection_sd=12.93, calibration_sd=13.3, old_designation='No. 100', opening=0.00015, compliance_samples=1000.0, opening_inch=5.9e-06, inspection_samples=100.0, designation='0.15', d_wire_max=1.2e-07, max_opening=0.193, X_variation_max=4.3e-05, Y_variation_avg=6.6e-06, compliance_sd=15.3),
 '0.18': Sieve(calibration_samples=200.0, d_wire_min=1.1e-07, d_wire=1.2e-07, inspection_sd=14.24, calibration_sd=14.65, old_designation='No. 80', opening=0.00018, compliance_samples=1000.0, opening_inch=7e-06, inspection_samples=100.0, designation='0.18', d_wire_max=1.5e-07, max_opening=0.227, X_variation_max=4.7e-05, Y_variation_avg=7.6e-06, compliance_sd=16.85),
 '0.212': Sieve(calibration_samples=160.0, d_wire_min=1.2e-07, d_wire=1.4e-07, inspection_sd=15.59, calibration_sd=16.08, old_designation='No. 70', opening=0.000212, compliance_samples=800.0, opening_inch=8.3e-06, inspection_samples=80.0, designation='0.212', d_wire_max=1.7e-07, max_opening=0.264, X_variation_max=5.2e-05, Y_variation_avg=8.7e-06, compliance_sd=18.79),
 '0.25': Sieve(calibration_samples=160.0, d_wire_min=1.3e-07, d_wire=1.6e-07, inspection_sd=17.44, calibration_sd=17.99, old_designation='No. 60', opening=0.00025, compliance_samples=800.0, opening_inch=9.8e-06, inspection_samples=80.0, designation='0.25', d_wire_max=1.9e-07, max_opening=0.308, X_variation_max=5.8e-05, Y_variation_avg=9.9e-06, compliance_sd=21.02),
 '0.3': Sieve(calibration_samples=160.0, d_wire_min=1.7e-07, d_wire=2e-07, inspection_sd=19.66, calibration_sd=20.29, old_designation='No. 50', opening=0.0003, compliance_samples=800.0, opening_inch=1.17e-05, inspection_samples=80.0, designation='0.3', d_wire_max=2.3e-07, max_opening=0.365, X_variation_max=6.5e-05, Y_variation_avg=1.15e-05, compliance_sd=23.7),
 '0.355': Sieve(calibration_samples=160.0, d_wire_min=1.9e-07, d_wire=2.2e-07, inspection_sd=21.95, calibration_sd=22.64, old_designation='No. 45', opening=0.000355, compliance_samples=800.0, opening_inch=1.39e-05, inspection_samples=80.0, designation='0.355', d_wire_max=2.6e-07, max_opening=0.427, X_variation_max=7.2e-05, Y_variation_avg=1.33e-05, compliance_sd=26.45),
 '0.425': Sieve(calibration_samples=120.0, d_wire_min=2.4e-07, d_wire=2.8e-07, inspection_sd=24.2, calibration_sd=25.08, old_designation='No. 40', opening=0.000425, compliance_samples=600.0, opening_inch=1.65e-05, inspection_samples=60.0, designation='0.425', d_wire_max=3.2e-07, max_opening=0.506, X_variation_max=8.1e-05, Y_variation_avg=1.55e-05, compliance_sd=29.95),
 '0.5': Sieve(calibration_samples=120.0, d_wire_min=2.7e-07, d_wire=3.2e-07, inspection_sd=26.85, calibration_sd=27.82, old_designation='No. 35', opening=0.0005, compliance_samples=600.0, opening_inch=1.97e-05, inspection_samples=60.0, designation='0.5', d_wire_max=3.6e-07, max_opening=0.589, X_variation_max=8.9e-05, Y_variation_avg=1.8e-05, compliance_sd=33.23),
 '0.6': Sieve(calibration_samples=100.0, d_wire_min=3.4e-07, d_wire=4e-07, inspection_sd=30.14, calibration_sd=31.32, old_designation='No. 30', opening=0.0006, compliance_samples=500.0, opening_inch=2.34e-05, inspection_samples=50.0, designation='0.6', d_wire_max=4.6e-07, max_opening=0.701, X_variation_max=0.000101, Y_variation_avg=2.12e-05, compliance_sd=38.0),
 '0.71': Sieve(calibration_samples=100.0, d_wire_min=3.8e-07, d_wire=4.5e-07, inspection_sd=33.82, calibration_sd=35.14, old_designation='No. 25', opening=0.00071, compliance_samples=500.0, opening_inch=2.78e-05, inspection_samples=50.0, designation='0.71', d_wire_max=5.2e-07, max_opening=0.822, X_variation_max=0.000112, Y_variation_avg=2.47e-05, compliance_sd=42.63),
 '0.85': Sieve(calibration_samples=80.0, d_wire_min=4.3e-07, d_wire=5e-07, inspection_sd=37.73, calibration_sd=39.36, old_designation='No. 20', opening=0.00085, compliance_samples=400.0, opening_inch=3.31e-05, inspection_samples=40.0, designation='0.85', d_wire_max=5.8e-07, max_opening=0.977, X_variation_max=0.000127, Y_variation_avg=2.91e-05, compliance_sd=48.76),
 '1': Sieve(calibration_samples=80.0, d_wire_min=0.00048, d_wire=0.00056, inspection_sd=0.042, calibration_sd=0.044, old_designation='No. 18', opening=0.001, compliance_samples=400.0, opening_inch=3.94e-05, inspection_samples=40.0, designation='1', d_wire_max=0.00064, max_opening=1.14, X_variation_max=0.00014, Y_variation_avg=3.4e-05, compliance_sd=0.055),
 '1.18': Sieve(calibration_samples=80.0, d_wire_min=0.00054, d_wire=0.00063, inspection_sd=0.049, calibration_sd=0.051, old_designation='No. 16', opening=0.00118, compliance_samples=400.0, opening_inch=4.69e-05, inspection_samples=40.0, designation='1.18', d_wire_max=0.00072, max_opening=1.34, X_variation_max=0.00016, Y_variation_avg=4e-05, compliance_sd=0.063),
 '1.4': Sieve(calibration_samples=80.0, d_wire_min=0.0006, d_wire=0.00071, inspection_sd=0.055, calibration_sd=0.057, old_designation='No. 14', opening=0.0014, compliance_samples=400.0, opening_inch=5.55e-05, inspection_samples=40.0, designation='1.4', d_wire_max=0.00082, max_opening=1.58, X_variation_max=0.00018, Y_variation_avg=4.6e-05, compliance_sd=0.071),
 '1.7': Sieve(calibration_samples=50.0, d_wire_min=0.00068, d_wire=0.0008, inspection_sd=0.059, calibration_sd=0.062, old_designation='No. 12', opening=0.0017, compliance_samples=250.0, opening_inch=6.61e-05, inspection_samples=25.0, designation='1.7', d_wire_max=0.00092, max_opening=1.9, X_variation_max=0.0002, Y_variation_avg=5.6e-05, compliance_sd=0.081),
 '100': Sieve(d_wire_min=0.0054, d_wire=0.0063, old_designation='4 in.', opening=0.1, compliance_samples=20.0, opening_inch=0.004, designation='100', d_wire_max=0.0072, max_opening=103.82, X_variation_max=0.00382, Y_variation_avg=0.00294),
 '106': Sieve(d_wire_min=0.0054, d_wire=0.0063, old_designation='4.24 in.', opening=0.106, compliance_samples=20.0, opening_inch=0.00424, designation='106', d_wire_max=0.0072, max_opening=109.99, X_variation_max=0.00399, Y_variation_avg=0.00312),
 '11.2': Sieve(calibration_samples=30.0, d_wire_min=0.0021, d_wire=0.0025, inspection_sd=0.256, calibration_sd=0.274, old_designation='7/16 in.', opening=0.0112, compliance_samples=150.0, opening_inch=0.000438, inspection_samples=15.0, designation='11.2', d_wire_max=0.0029, max_opening=11.97, X_variation_max=0.00077, Y_variation_avg=0.000346, compliance_sd=0.382),
 '12.5': Sieve(calibration_samples=30.0, d_wire_min=0.0021, d_wire=0.0025, inspection_sd=0.283, calibration_sd=0.302, old_designation='1/2 in.', opening=0.0125, compliance_samples=150.0, opening_inch=0.0005, inspection_samples=15.0, designation='12.5', d_wire_max=0.0029, max_opening=13.33, X_variation_max=0.00083, Y_variation_avg=0.000385, compliance_sd=0.421),
 '125': Sieve(d_wire_min=0.0068, d_wire=0.008, old_designation='5 in.', opening=0.125, compliance_samples=20.0, opening_inch=0.005, designation='125', d_wire_max=0.0092, max_opening=129.51, X_variation_max=0.00451, Y_variation_avg=0.00366),
 '13.2': Sieve(calibration_samples=30.0, d_wire_min=0.0024, d_wire=0.0028, inspection_sd=0.296, calibration_sd=0.316, old_designation='0.530 in.', opening=0.0132, compliance_samples=150.0, opening_inch=0.00053, inspection_samples=15.0, designation='13.2', d_wire_max=0.0032, max_opening=14.06, X_variation_max=0.00086, Y_variation_avg=0.000406, compliance_sd=0.441),
 '16': Sieve(calibration_samples=30.0, d_wire_min=0.0027, d_wire=0.00315, inspection_sd=0.354, calibration_sd=0.378, old_designation='5/8 in.', opening=0.016, compliance_samples=150.0, opening_inch=0.000625, inspection_samples=15.0, designation='16', d_wire_max=0.0036, max_opening=16.99, X_variation_max=0.00099, Y_variation_avg=0.00049, compliance_sd=0.527),
 '19': Sieve(calibration_samples=30.0, d_wire_min=0.0027, d_wire=0.00315, inspection_sd=0.418, calibration_sd=0.446, old_designation='3/4 in.', opening=0.019, compliance_samples=150.0, opening_inch=0.00075, inspection_samples=15.0, designation='19', d_wire_max=0.0035, max_opening=20.13, X_variation_max=0.00113, Y_variation_avg=0.000579, compliance_sd=0.622),
 '2': Sieve(calibration_samples=50.0, d_wire_min=0.00077, d_wire=0.0009, inspection_sd=0.068, calibration_sd=0.072, old_designation='No. 10', opening=0.002, compliance_samples=250.0, opening_inch=7.87e-05, inspection_samples=25.0, designation='2', d_wire_max=0.00104, max_opening=2.23, X_variation_max=0.00023, Y_variation_avg=6.5e-05, compliance_sd=0.094),
 '2.36': Sieve(calibration_samples=40.0, d_wire_min=0.00085, d_wire=0.001, inspection_sd=0.073, calibration_sd=0.077, old_designation='No. 8', opening=0.00236, compliance_samples=200.0, opening_inch=9.37e-05, inspection_samples=20.0, designation='2.36', d_wire_max=0.00115, max_opening=2.61, X_variation_max=0.00025, Y_variation_avg=7.6e-05, compliance_sd=0.104),
 '2.8': Sieve(calibration_samples=40.0, d_wire_min=0.00095, d_wire=0.00112, inspection_sd=0.085, calibration_sd=0.09, old_designation='No. 7', opening=0.0028, compliance_samples=200.0, opening_inch=0.00011, inspection_samples=20.0, designation='2.8', d_wire_max=0.0013, max_opening=3.09, X_variation_max=0.00029, Y_variation_avg=9e-05, compliance_sd=0.121),
 '22.4': Sieve(d_wire_min=0.003, d_wire=0.00355, inspection_sd=0.493, old_designation='7/8 in.', opening=0.0224, compliance_samples=150.0, opening_inch=0.000875, inspection_samples=15.0, designation='22.4', d_wire_max=0.0041, max_opening=23.67, X_variation_max=0.00127, Y_variation_avg=0.000681, compliance_sd=0.734),
 '25': Sieve(d_wire_min=0.003, d_wire=0.00355, inspection_sd=0.553, old_designation='1.00 in.', opening=0.025, compliance_samples=20.0, opening_inch=0.001, inspection_samples=15.0, designation='25', d_wire_max=0.0041, max_opening=26.38, X_variation_max=0.00138, Y_variation_avg=0.000758, compliance_sd=0.823),
 '26.5': Sieve(d_wire_min=0.003, d_wire=0.00355, inspection_sd=0.584, old_designation='1.06 in.', opening=0.0265, compliance_samples=20.0, opening_inch=0.00106, inspection_samples=15.0, designation='26.5', d_wire_max=0.0041, max_opening=27.94, X_variation_max=0.00144, Y_variation_avg=0.000802, compliance_sd=0.869),
 '3.35': Sieve(calibration_samples=40.0, d_wire_min=0.00106, d_wire=0.00125, inspection_sd=0.097, calibration_sd=0.103, old_designation='No. 6', opening=0.00335, compliance_samples=200.0, opening_inch=0.000132, inspection_samples=20.0, designation='3.35', d_wire_max=0.0015, max_opening=3.67, X_variation_max=0.00032, Y_variation_avg=0.000107, compliance_sd=0.138),
 '31.5': Sieve(d_wire_min=0.0034, d_wire=0.004, old_designation='1 1/4 in.', opening=0.0315, compliance_samples=20.0, opening_inch=0.00125, designation='31.5', d_wire_max=0.0046, max_opening=33.13, X_variation_max=0.00163, Y_variation_avg=0.00095, compliance_sd=1.066),
 '37.5': Sieve(d_wire_min=0.0038, d_wire=0.0045, old_designation='1 1/2 in.', opening=0.0375, compliance_samples=20.0, opening_inch=0.0015, designation='37.5', d_wire_max=0.0052, max_opening=39.35, X_variation_max=0.00185, Y_variation_avg=0.00113, compliance_sd=1.374),
 '4': Sieve(calibration_samples=30.0, d_wire_min=0.0012, d_wire=0.0014, inspection_sd=0.108, calibration_sd=0.115, old_designation='No. 5', opening=0.004, compliance_samples=150.0, opening_inch=0.000157, inspection_samples=15.0, designation='4', d_wire_max=0.0017, max_opening=4.37, X_variation_max=0.00037, Y_variation_avg=0.000127, compliance_sd=0.161),
 '4.75': Sieve(calibration_samples=30.0, d_wire_min=0.0013, d_wire=0.0016, inspection_sd=0.123, calibration_sd=0.131, old_designation='No. 4', opening=0.00475, compliance_samples=150.0, opening_inch=0.000187, inspection_samples=15.0, designation='4.75', d_wire_max=0.0019, max_opening=5.16, X_variation_max=0.00041, Y_variation_avg=0.00015, compliance_sd=0.182),
 '45': Sieve(d_wire_min=0.0038, d_wire=0.0045, old_designation='1 3/4 in.', opening=0.045, compliance_samples=20.0, opening_inch=0.00175, designation='45', d_wire_max=0.0052, max_opening=47.12, X_variation_max=0.00212, Y_variation_avg=0.00135),
 '5.6': Sieve(calibration_samples=30.0, d_wire_min=0.0013, d_wire=0.0016, inspection_sd=0.142, calibration_sd=0.151, old_designation='No. 3 1/2', opening=0.0056, compliance_samples=150.0, opening_inch=0.000223, inspection_samples=15.0, designation='5.6', d_wire_max=0.0019, max_opening=6.07, X_variation_max=0.00047, Y_variation_avg=0.000176, compliance_sd=0.211),
 '50': Sieve(d_wire_min=0.0043, d_wire=0.005, old_designation='2 in.', opening=0.05, compliance_samples=20.0, opening_inch=0.002, designation='50', d_wire_max=0.0058, max_opening=52.29, X_variation_max=0.00229, Y_variation_avg=0.00149),
 '53': Sieve(d_wire_min=0.0043, d_wire=0.005, old_designation='2.12 in.', opening=0.053, compliance_samples=20.0, opening_inch=0.00212, designation='53', d_wire_max=0.0058, max_opening=55.39, X_variation_max=0.00239, Y_variation_avg=0.00158),
 '6.3': Sieve(calibration_samples=30.0, d_wire_min=0.0015, d_wire=0.0018, inspection_sd=0.157, calibration_sd=0.167, old_designation='1/4 in.', opening=0.0063, compliance_samples=150.0, opening_inch=0.00025, inspection_samples=15.0, designation='6.3', d_wire_max=0.0021, max_opening=6.81, X_variation_max=0.00051, Y_variation_avg=0.000197, compliance_sd=0.233),
 '6.7': Sieve(calibration_samples=30.0, d_wire_min=0.0015, d_wire=0.0018, inspection_sd=0.164, calibration_sd=0.175, old_designation='0.265 in.', opening=0.0067, compliance_samples=150.0, opening_inch=0.000265, inspection_samples=15.0, designation='6.7', d_wire_max=0.0021, max_opening=7.23, X_variation_max=0.00053, Y_variation_avg=0.00021, compliance_sd=0.245),
 '63': Sieve(d_wire_min=0.0048, d_wire=0.0056, old_designation='2 1/2 in.', opening=0.063, compliance_samples=20.0, opening_inch=0.0025, designation='63', d_wire_max=0.0064, max_opening=65.71, X_variation_max=0.00271, Y_variation_avg=0.00187),
 '75': Sieve(d_wire_min=0.0054, d_wire=0.0063, old_designation='3 in.', opening=0.075, compliance_samples=20.0, opening_inch=0.003, designation='75', d_wire_max=0.0072, max_opening=78.09, X_variation_max=0.00309, Y_variation_avg=0.00222),
 '8': Sieve(calibration_samples=30.0, d_wire_min=0.0017, d_wire=0.002, inspection_sd=0.191, calibration_sd=0.204, old_designation='5/16 in.', opening=0.008, compliance_samples=150.0, opening_inch=0.000312, inspection_samples=15.0, designation='8', d_wire_max=0.0023, max_opening=8.6, X_variation_max=0.0006, Y_variation_avg=0.000249, compliance_sd=0.284),
 '9.5': Sieve(calibration_samples=30.0, d_wire_min=0.0019, d_wire=0.00224, inspection_sd=0.222, calibration_sd=0.237, old_designation='3/8 in.', opening=0.0095, compliance_samples=150.0, opening_inch=0.000375, inspection_samples=15.0, designation='9.5', d_wire_max=0.0026, max_opening=10.18, X_variation_max=0.00068, Y_variation_avg=0.000295, compliance_sd=0.33),
 '90': Sieve(d_wire_min=0.0054, d_wire=0.0063, old_designation='3 1/2 in.', opening=0.09, compliance_samples=20.0, opening_inch=0.0035, designation='90', d_wire_max=0.0072, max_opening=93.53, X_variation_max=0.00353, Y_variation_avg=0.00265)
 };
/*Dictionary containing ASTM E-11 sieve series :py:func:`Sieve` objects, indexed by
their size in mm as a string.

References
----------
.. [1] ASTM E11 - 17 - Standard Specification for Woven Wire Test Sieve
   Cloth and Test Sieves.
*/

ASTM_E11_sieve_designations = ['125', '106', '100', '90', '75', '63', '53',
                               '50', '45', '37.5', '31.5', '26.5', '25',
                               '22.4', '19', '16', '13.2', '12.5', '11.2',
                               '9.5', '8', '6.7', '6.3', '5.6', '4.75', '4',
                               '3.35', '2.8', '2.36', '2', '1.7', '1.4',
                               '1.18', '1', '0.85', '0.71', '0.6', '0.5',
                               '0.425', '0.355', '0.3', '0.25', '0.212',
                               '0.18', '0.15', '0.125', '0.106', '0.09',
                               '0.075', '0.063', '0.053', '0.045', '0.038',
                               '0.032', '0.025', '0.02'];

ASTM_E11_sieve_list = ASTM_E11_sieve_designations.map((i) => ASTM_E11_sieves[i])




ISO_3310_1_sieves = {
 '0.02': Sieve(designation='0.02', d_wire_max=2.3e-05, compliance_sd=4.7e-06, X_variation_max=1.3e-05, d_wire=2e-05, Y_variation_avg=2.1e-06, d_wire_min=2.3e-05, opening=2e-05),
 '0.025': Sieve(designation='0.025', d_wire_max=2.9e-05, compliance_sd=5.2e-06, X_variation_max=1.5e-05, d_wire=2.5e-05, Y_variation_avg=2.2e-06, d_wire_min=2.9e-05, opening=2.5e-05),
 '0.032': Sieve(designation='0.032', d_wire_max=3.3e-05, compliance_sd=5.9e-06, X_variation_max=1.7e-05, d_wire=2.8e-05, Y_variation_avg=2.4e-06, d_wire_min=3.3e-05, opening=3.2e-05),
 '0.036': Sieve(designation='0.036', d_wire_max=3.5e-05, compliance_sd=6.3e-06, X_variation_max=1.8e-05, d_wire=3e-05, Y_variation_avg=2.6e-06, d_wire_min=3.5e-05, opening=3.6e-05),
 '0.038': Sieve(designation='0.038', d_wire_max=3.5e-05, compliance_sd=6.4e-06, X_variation_max=1.8e-05, d_wire=3e-05, Y_variation_avg=2.6e-06, d_wire_min=3.5e-05, opening=3.8e-05),
 '0.04': Sieve(designation='0.04', d_wire_max=3.7e-05, compliance_sd=6.5e-06, X_variation_max=1.9e-05, d_wire=3.2e-05, Y_variation_avg=2.7e-06, d_wire_min=3.7e-05, opening=4e-05),
 '0.045': Sieve(designation='0.045', d_wire_max=3.7e-05, compliance_sd=6.9e-06, X_variation_max=2e-05, d_wire=3.2e-05, Y_variation_avg=2.8e-06, d_wire_min=3.7e-05, opening=4.5e-05),
 '0.05': Sieve(designation='0.05', d_wire_max=4.1e-05, compliance_sd=7.3e-06, X_variation_max=2.1e-05, d_wire=3.6e-05, Y_variation_avg=3e-06, d_wire_min=4.1e-05, opening=5e-05),
 '0.053': Sieve(designation='0.053', d_wire_max=4.1e-05, compliance_sd=7.6e-06, X_variation_max=2.1e-05, d_wire=3.6e-05, Y_variation_avg=3.1e-06, d_wire_min=4.1e-05, opening=5.3e-05),
 '0.056': Sieve(designation='0.056', d_wire_max=4.6e-05, compliance_sd=7.8e-06, X_variation_max=2.2e-05, d_wire=4e-05, Y_variation_avg=3.2e-06, d_wire_min=4.6e-05, opening=5.6e-05),
 '0.063': Sieve(designation='0.063', d_wire_max=5.2e-05, compliance_sd=8.3e-06, X_variation_max=2.4e-05, d_wire=4.5e-05, Y_variation_avg=3.4e-06, d_wire_min=5.2e-05, opening=6.3e-05),
 '0.071': Sieve(designation='0.071', d_wire_max=5.8e-05, compliance_sd=8.9e-06, X_variation_max=2.5e-05, d_wire=5e-05, Y_variation_avg=3.6e-06, d_wire_min=4.3e-05, opening=7.1e-05),
 '0.075': Sieve(designation='0.075', d_wire_max=5.8e-05, compliance_sd=9.1e-06, X_variation_max=2.6e-05, d_wire=5e-05, Y_variation_avg=3.7e-06, d_wire_min=4.3e-05, opening=7.5e-05),
 '0.08': Sieve(designation='0.08', d_wire_max=6.4e-05, compliance_sd=9.4e-06, X_variation_max=2.7e-05, d_wire=5.6e-05, Y_variation_avg=3.9e-06, d_wire_min=4.8e-05, opening=8e-05),
 '0.09': Sieve(designation='0.09', d_wire_max=7.2e-05, compliance_sd=1.01e-05, X_variation_max=2.9e-05, d_wire=6.3e-05, Y_variation_avg=4.2e-06, d_wire_min=5.4e-05, opening=9e-05),
 '0.1': Sieve(designation='0.1', d_wire_max=8.2e-05, compliance_sd=1.08e-05, X_variation_max=3e-05, d_wire=7.1e-05, Y_variation_avg=4.5e-06, d_wire_min=6e-05, opening=0.0001),
 '0.106': Sieve(designation='0.106', d_wire_max=8.2e-05, compliance_sd=1.11e-05, X_variation_max=3.1e-05, d_wire=7.1e-05, Y_variation_avg=4.7e-06, d_wire_min=6e-05, opening=0.000106),
 '0.112': Sieve(designation='0.112', d_wire_max=9.2e-05, compliance_sd=1.15e-05, X_variation_max=3.2e-05, d_wire=8e-05, Y_variation_avg=4.8e-06, d_wire_min=6.8e-05, opening=0.000112),
 '0.125': Sieve(designation='0.125', d_wire_max=0.000104, compliance_sd=1.22e-05, X_variation_max=3.4e-05, d_wire=9e-05, Y_variation_avg=5.2e-06, d_wire_min=7.7e-05, opening=0.000125),
 '0.14': Sieve(designation='0.14', d_wire_max=0.000115, compliance_sd=1.31e-05, X_variation_max=3.7e-05, d_wire=0.0001, Y_variation_avg=5.7e-06, d_wire_min=8.5e-05, opening=0.00014),
 '0.15': Sieve(designation='0.15', d_wire_max=0.000115, compliance_sd=1.37e-05, X_variation_max=3.8e-05, d_wire=0.0001, Y_variation_avg=6e-06, d_wire_min=8.5e-05, opening=0.00015),
 '0.16': Sieve(designation='0.16', d_wire_max=0.00013, compliance_sd=1.42e-05, X_variation_max=4e-05, d_wire=0.000112, Y_variation_avg=6.3e-06, d_wire_min=9.5e-05, opening=0.00016),
 '0.18': Sieve(designation='0.18', d_wire_max=0.00015, compliance_sd=1.53e-05, X_variation_max=4.3e-05, d_wire=0.000125, Y_variation_avg=6.8e-06, d_wire_min=0.000106, opening=0.00018),
 '0.2': Sieve(designation='0.2', d_wire_max=0.00017, compliance_sd=1.63e-05, X_variation_max=4.5e-05, d_wire=0.00014, Y_variation_avg=7.4e-06, d_wire_min=0.00012, opening=0.0002),
 '0.212': Sieve(designation='0.212', d_wire_max=0.00017, compliance_sd=1.69e-05, X_variation_max=4.7e-05, d_wire=0.00014, Y_variation_avg=7.8e-06, d_wire_min=0.00012, opening=0.000212),
 '0.224': Sieve(designation='0.224', d_wire_max=0.00019, compliance_sd=1.75e-05, X_variation_max=4.9e-05, d_wire=0.00016, Y_variation_avg=8.1e-06, d_wire_min=0.00013, opening=0.000224),
 '0.25': Sieve(designation='0.25', d_wire_max=0.00019, compliance_sd=1.88e-05, X_variation_max=5.2e-05, d_wire=0.00016, Y_variation_avg=8.9e-06, d_wire_min=0.00013, opening=0.00025),
 '0.28': Sieve(designation='0.28', d_wire_max=0.00021, compliance_sd=2.03e-05, X_variation_max=5.6e-05, d_wire=0.00018, Y_variation_avg=1e-05, d_wire_min=0.00015, opening=0.00028),
 '0.3': Sieve(designation='0.3', d_wire_max=0.00023, compliance_sd=2.12e-05, X_variation_max=5.8e-05, d_wire=0.0002, Y_variation_avg=1e-05, d_wire_min=0.00017, opening=0.0003),
 '0.315': Sieve(designation='0.315', d_wire_max=0.00023, compliance_sd=2.19e-05, X_variation_max=6e-05, d_wire=0.0002, Y_variation_avg=1.1e-05, d_wire_min=0.00017, opening=0.000315),
 '0.355': Sieve(designation='0.355', d_wire_max=0.00026, compliance_sd=2.37e-05, X_variation_max=6.5e-05, d_wire=0.000224, Y_variation_avg=1.2e-05, d_wire_min=0.00019, opening=0.000355),
 '0.4': Sieve(designation='0.4', d_wire_max=0.00029, compliance_sd=2.57e-05, X_variation_max=7e-05, d_wire=0.00025, Y_variation_avg=1.3e-05, d_wire_min=0.00021, opening=0.0004),
 '0.425': Sieve(designation='0.425', d_wire_max=0.00032, compliance_sd=2.68e-05, X_variation_max=7.3e-05, d_wire=0.00028, Y_variation_avg=1.4e-05, d_wire_min=0.00024, opening=0.000425),
 '0.45': Sieve(designation='0.45', d_wire_max=0.00032, compliance_sd=2.79e-05, X_variation_max=7.5e-05, d_wire=0.00028, Y_variation_avg=1.5e-05, d_wire_min=0.00024, opening=0.00045),
 '0.5': Sieve(designation='0.5', d_wire_max=0.00036, compliance_sd=3e-05, X_variation_max=8e-05, d_wire=0.000315, Y_variation_avg=1.6e-05, d_wire_min=0.00027, opening=0.0005),
 '0.56': Sieve(designation='0.56', d_wire_max=0.00041, compliance_sd=3.24e-05, X_variation_max=8.7e-05, d_wire=0.000355, Y_variation_avg=1.8e-05, d_wire_min=0.0003, opening=0.00056),
 '0.6': Sieve(designation='0.6', d_wire_max=0.00046, compliance_sd=3.4e-05, X_variation_max=9.1e-05, d_wire=0.0004, Y_variation_avg=1.9e-05, d_wire_min=0.00034, opening=0.0006),
 '0.63': Sieve(designation='0.63', d_wire_max=0.00046, compliance_sd=3.52e-05, X_variation_max=9.3e-05, d_wire=0.0004, Y_variation_avg=2e-05, d_wire_min=0.00034, opening=0.00063),
 '0.71': Sieve(designation='0.71', d_wire_max=0.00052, compliance_sd=3.84e-05, X_variation_max=0.000101, d_wire=0.00045, Y_variation_avg=2.2e-05, d_wire_min=0.00038, opening=0.00071),
 '0.8': Sieve(designation='0.8', d_wire_max=0.00052, compliance_sd=4.18e-05, X_variation_max=0.000109, d_wire=0.00045, Y_variation_avg=2.5e-05, d_wire_min=0.00038, opening=0.0008),
 '0.85': Sieve(designation='0.85', d_wire_max=0.00058, compliance_sd=4.36e-05, X_variation_max=0.000114, d_wire=0.0005, Y_variation_avg=2.6e-05, d_wire_min=0.00043, opening=0.00085),
 '0.9': Sieve(designation='0.9', d_wire_max=0.00058, compliance_sd=4.55e-05, X_variation_max=0.000118, d_wire=0.0005, Y_variation_avg=2.8e-05, d_wire_min=0.00043, opening=0.0009),
 '1': Sieve(designation='1', d_wire_max=0.00064, compliance_sd=4.9e-05, X_variation_max=0.00013, d_wire=0.00056, Y_variation_avg=3e-05, d_wire_min=0.00048, opening=0.001),
 '1.12': Sieve(designation='1.12', d_wire_max=0.00064, compliance_sd=5.3e-05, X_variation_max=0.00014, d_wire=0.00056, Y_variation_avg=3e-05, d_wire_min=0.00048, opening=0.00112),
 '1.18': Sieve(designation='1.18', d_wire_max=0.00072, compliance_sd=5.6e-05, X_variation_max=0.00014, d_wire=0.00063, Y_variation_avg=4e-05, d_wire_min=0.00054, opening=0.00118),
 '1.25': Sieve(designation='1.25', d_wire_max=0.00072, compliance_sd=5.8e-05, X_variation_max=0.00015, d_wire=0.00063, Y_variation_avg=4e-05, d_wire_min=0.00054, opening=0.00125),
 '1.4': Sieve(designation='1.4', d_wire_max=0.00082, compliance_sd=6.3e-05, X_variation_max=0.00016, d_wire=0.00071, Y_variation_avg=4e-05, d_wire_min=0.0006, opening=0.0014),
 '1.6': Sieve(designation='1.6', d_wire_max=0.00092, compliance_sd=7e-05, X_variation_max=0.00017, d_wire=0.0008, Y_variation_avg=5e-05, d_wire_min=0.00068, opening=0.0016),
 '1.7': Sieve(designation='1.7', d_wire_max=0.00092, compliance_sd=7.3e-05, X_variation_max=0.00018, d_wire=0.0008, Y_variation_avg=5e-05, d_wire_min=0.00068, opening=0.0017),
 '1.8': Sieve(designation='1.8', d_wire_max=0.00092, compliance_sd=7.6e-05, X_variation_max=0.00019, d_wire=0.0008, Y_variation_avg=5e-05, d_wire_min=0.00068, opening=0.0018),
 '10': Sieve(designation='10', d_wire_max=0.0029, compliance_sd=0.000307, X_variation_max=0.00064, d_wire=0.0025, Y_variation_avg=0.00028, d_wire_min=0.0021, opening=0.01),
 '100': Sieve(designation='100', d_wire_max=0.0072, X_variation_max=0.00344, d_wire=0.0063, Y_variation_avg=0.00265, d_wire_min=0.0054, opening=0.1),
 '106': Sieve(designation='106', d_wire_max=0.0072, X_variation_max=0.00359, d_wire=0.0063, Y_variation_avg=0.0028, d_wire_min=0.0054, opening=0.106),
 '11.2': Sieve(designation='11.2', d_wire_max=0.0029, compliance_sd=0.000339, X_variation_max=0.00069, d_wire=0.0025, Y_variation_avg=0.00031, d_wire_min=0.0021, opening=0.0112),
 '112': Sieve(designation='112', d_wire_max=0.0092, X_variation_max=0.00374, d_wire=0.008, Y_variation_avg=0.00296, d_wire_min=0.0068, opening=0.112),
 '12.5': Sieve(designation='12.5', d_wire_max=0.0029, compliance_sd=0.000374, X_variation_max=0.00075, d_wire=0.0025, Y_variation_avg=0.00035, d_wire_min=0.0021, opening=0.0125),
 '125': Sieve(designation='125', d_wire_max=0.0092, X_variation_max=0.00406, d_wire=0.008, Y_variation_avg=0.0033, d_wire_min=0.0068, opening=0.125),
 '13.2': Sieve(designation='13.2', d_wire_max=0.0032, compliance_sd=0.000392, X_variation_max=0.00078, d_wire=0.0028, Y_variation_avg=0.00037, d_wire_min=0.0024, opening=0.0132),
 '14': Sieve(designation='14', d_wire_max=0.0032, compliance_sd=0.000413, X_variation_max=0.00081, d_wire=0.0028, Y_variation_avg=0.00039, d_wire_min=0.0024, opening=0.014),
 '16': Sieve(designation='16', d_wire_max=0.0036, compliance_sd=0.000467, X_variation_max=0.00089, d_wire=0.00315, Y_variation_avg=0.00044, d_wire_min=0.0027, opening=0.016),
 '18': Sieve(designation='18', d_wire_max=0.0036, compliance_sd=0.00052, X_variation_max=0.00097, d_wire=0.00315, Y_variation_avg=0.00049, d_wire_min=0.0027, opening=0.018),
 '19': Sieve(designation='19', d_wire_max=0.0036, compliance_sd=0.000548, X_variation_max=0.00101, d_wire=0.00315, Y_variation_avg=0.00052, d_wire_min=0.0027, opening=0.019),
 '2': Sieve(designation='2', d_wire_max=0.00104, compliance_sd=8.3e-05, X_variation_max=0.0002, d_wire=0.0009, Y_variation_avg=6e-05, d_wire_min=0.00077, opening=0.002),
 '2.24': Sieve(designation='2.24', d_wire_max=0.00104, compliance_sd=9e-05, X_variation_max=0.00022, d_wire=0.0009, Y_variation_avg=7e-05, d_wire_min=0.00077, opening=0.00224),
 '2.36': Sieve(designation='2.36', d_wire_max=0.00115, compliance_sd=9.4e-05, X_variation_max=0.00023, d_wire=0.001, Y_variation_avg=7e-05, d_wire_min=0.00085, opening=0.00236),
 '2.5': Sieve(designation='2.5', d_wire_max=0.00115, compliance_sd=9.8e-05, X_variation_max=0.00024, d_wire=0.001, Y_variation_avg=7e-05, d_wire_min=0.00085, opening=0.0025),
 '2.8': Sieve(designation='2.8', d_wire_max=0.0013, compliance_sd=0.000108, X_variation_max=0.00026, d_wire=0.00112, Y_variation_avg=8e-05, d_wire_min=0.00095, opening=0.0028),
 '20': Sieve(designation='20', d_wire_max=0.0036, compliance_sd=0.000575, X_variation_max=0.00105, d_wire=0.00315, Y_variation_avg=0.00055, d_wire_min=0.0027, opening=0.02),
 '22.4': Sieve(designation='22.4', d_wire_max=0.0041, compliance_sd=0.000641, X_variation_max=0.00114, d_wire=0.00355, Y_variation_avg=0.00061, d_wire_min=0.003, opening=0.0224),
 '25': Sieve(designation='25', d_wire_max=0.0041, compliance_sd=0.000713, X_variation_max=0.00124, d_wire=0.00355, Y_variation_avg=0.00068, d_wire_min=0.003, opening=0.025),
 '26.5': Sieve(designation='26.5', d_wire_max=0.0041, compliance_sd=0.000757, X_variation_max=0.00129, d_wire=0.00355, Y_variation_avg=0.00072, d_wire_min=0.003, opening=0.0265),
 '28': Sieve(designation='28', d_wire_max=0.0041, compliance_sd=0.000801, X_variation_max=0.00135, d_wire=0.00355, Y_variation_avg=0.00076, d_wire_min=0.003, opening=0.028),
 '3.15': Sieve(designation='3.15', d_wire_max=0.0015, compliance_sd=0.000118, X_variation_max=0.00028, d_wire=0.00125, Y_variation_avg=9e-05, d_wire_min=0.00106, opening=0.00315),
 '3.35': Sieve(designation='3.35', d_wire_max=0.0015, compliance_sd=0.000124, X_variation_max=0.00029, d_wire=0.00125, Y_variation_avg=0.0001, d_wire_min=0.00106, opening=0.00335),
 '3.55': Sieve(designation='3.55', d_wire_max=0.0015, compliance_sd=0.00013, X_variation_max=0.0003, d_wire=0.00125, Y_variation_avg=0.0001, d_wire_min=0.00106, opening=0.00355),
 '31.5': Sieve(designation='31.5', d_wire_max=0.0046, compliance_sd=0.000905, X_variation_max=0.00147, d_wire=0.004, Y_variation_avg=0.00085, d_wire_min=0.0034, opening=0.0315),
 '35.5': Sieve(designation='35.5', d_wire_max=0.0046, compliance_sd=0.001, X_variation_max=0.0016, d_wire=0.004, Y_variation_avg=0.00096, d_wire_min=0.0034, opening=0.0355),
 '37.5': Sieve(designation='37.5', d_wire_max=0.0052, compliance_sd=0.001, X_variation_max=0.00167, d_wire=0.0045, Y_variation_avg=0.00101, d_wire_min=0.0038, opening=0.0375),
 '4': Sieve(designation='4', d_wire_max=0.0017, compliance_sd=0.000143, X_variation_max=0.00033, d_wire=0.0014, Y_variation_avg=0.00011, d_wire_min=0.0012, opening=0.004),
 '4.5': Sieve(designation='4.5', d_wire_max=0.0017, compliance_sd=0.000157, X_variation_max=0.00036, d_wire=0.0014, Y_variation_avg=0.00013, d_wire_min=0.0012, opening=0.0045),
 '4.75': Sieve(designation='4.75', d_wire_max=0.0019, compliance_sd=0.000164, X_variation_max=0.00037, d_wire=0.0016, Y_variation_avg=0.00014, d_wire_min=0.0013, opening=0.00475),
 '40': Sieve(designation='40', d_wire_max=0.0052, compliance_sd=0.001, X_variation_max=0.00175, d_wire=0.0045, Y_variation_avg=0.00108, d_wire_min=0.0038, opening=0.04),
 '45': Sieve(designation='45', d_wire_max=0.0052, compliance_sd=0.001, X_variation_max=0.00191, d_wire=0.0045, Y_variation_avg=0.00121, d_wire_min=0.0038, opening=0.045),
 '5': Sieve(designation='5', d_wire_max=0.0019, compliance_sd=0.000171, X_variation_max=0.00039, d_wire=0.0016, Y_variation_avg=0.00014, d_wire_min=0.0013, opening=0.005),
 '5.6': Sieve(designation='5.6', d_wire_max=0.0019, compliance_sd=0.000188, X_variation_max=0.00042, d_wire=0.0016, Y_variation_avg=0.00016, d_wire_min=0.0013, opening=0.0056),
 '50': Sieve(designation='50', d_wire_max=0.0058, X_variation_max=0.00206, d_wire=0.005, Y_variation_avg=0.00134, d_wire_min=0.0043, opening=0.05),
 '53': Sieve(designation='53', d_wire_max=0.0058, X_variation_max=0.00215, d_wire=0.005, Y_variation_avg=0.00142, d_wire_min=0.0043, opening=0.053),
 '56': Sieve(designation='56', d_wire_max=0.0058, X_variation_max=0.00224, d_wire=0.005, Y_variation_avg=0.0015, d_wire_min=0.0043, opening=0.056),
 '6.3': Sieve(designation='6.3', d_wire_max=0.0021, compliance_sd=0.000207, X_variation_max=0.00046, d_wire=0.0018, Y_variation_avg=0.00018, d_wire_min=0.0015, opening=0.0063),
 '6.7': Sieve(designation='6.7', d_wire_max=0.0021, compliance_sd=0.000218, X_variation_max=0.00048, d_wire=0.0018, Y_variation_avg=0.00019, d_wire_min=0.0015, opening=0.0067),
 '63': Sieve(designation='63', d_wire_max=0.0064, X_variation_max=0.00244, d_wire=0.0056, Y_variation_avg=0.00169, d_wire_min=0.0048, opening=0.063),
 '7.1': Sieve(designation='7.1', d_wire_max=0.0021, compliance_sd=0.000229, X_variation_max=0.0005, d_wire=0.0018, Y_variation_avg=0.0002, d_wire_min=0.0015, opening=0.0071),
 '71': Sieve(designation='71', d_wire_max=0.0064, X_variation_max=0.00267, d_wire=0.0056, Y_variation_avg=0.00189, d_wire_min=0.0048, opening=0.071),
 '75': Sieve(designation='75', d_wire_max=0.0072, X_variation_max=0.00278, d_wire=0.0063, Y_variation_avg=0.002, d_wire_min=0.0054, opening=0.075),
 '8': Sieve(designation='8', d_wire_max=0.0023, compliance_sd=0.000254, X_variation_max=0.00054, d_wire=0.002, Y_variation_avg=0.00022, d_wire_min=0.0017, opening=0.008),
 '80': Sieve(designation='80', d_wire_max=0.0072, X_variation_max=0.00291, d_wire=0.0063, Y_variation_avg=0.00213, d_wire_min=0.0054, opening=0.08),
 '9': Sieve(designation='9', d_wire_max=0.0026, compliance_sd=0.000281, X_variation_max=0.00059, d_wire=0.00224, Y_variation_avg=0.00025, d_wire_min=0.0019, opening=0.009),
 '9.5': Sieve(designation='9.5', d_wire_max=0.0026, compliance_sd=0.000294, X_variation_max=0.00061, d_wire=0.00224, Y_variation_avg=0.00027, d_wire_min=0.0019, opening=0.0095),
 '90': Sieve(designation='90', d_wire_max=0.0072, X_variation_max=0.00318, d_wire=0.0063, Y_variation_avg=0.00239, d_wire_min=0.0054, opening=0.09)
};
/*Dictionary containing all of the individual :py:func:`Sieve` objects, on the
ISO 3310-1:2016 series, indexed by their size in mm as a string.

References
----------
.. [1] ISO 3310-1:2016 - Test Sieves -- Technical Requirements and Testing
   -- Part 1: Test Sieves of Metal Wire Cloth.
*/

ISO_3310_1_sieve_designations  = ['125', '112', '106', '100', '90', '80', '75',
                                  '71', '63', '56', '53', '50', '45', '40',
                                  '37.5', '35.5', '31.5', '28', '26.5', '25',
                                  '22.4', '20', '19', '18', '16', '14', '13.2',
                                  '12.5', '11.2', '10', '9.5', '9', '8', '7.1',
                                  '6.7', '6.3', '5.6', '5', '4.75', '4.5', '4',
                                  '3.55', '3.35', '3.15', '2.8', '2.5', '2.36',
                                  '2.24', '2', '1.8', '1.7', '1.6', '1.4',
                                  '1.25', '1.18', '1.12', '1', '0.9', '0.85',
                                  '0.8', '0.71', '0.63', '0.6', '0.56', '0.5',
                                  '0.45', '0.425', '0.4', '0.355', '0.315',
                                  '0.3', '0.28', '0.25', '0.224', '0.212',
                                  '0.2', '0.18', '0.16', '0.15', '0.14',
                                  '0.125', '0.112', '0.106', '0.1', '0.09',
                                  '0.08', '0.075', '0.071', '0.063', '0.056',
                                  '0.053', '0.05', '0.045', '0.04', '0.038',
                                  '0.036', '0.032', '0.025', '0.02'];

ISO_3310_1_sieve_list = ISO_3310_1_sieve_designations.map((i) => ISO_3310_1_sieves[i])


ISO_3310_1_R20_3 = ['125', '90', '63', '45', '31.5', '22.4', '16', '11.2', '8', '5.6', '4', '2.8', '2', '1.4', '1', '0.71', '0.5', '0.355', '0.25', '0.18', '0.125', '0.09', '0.063', '0.045']
ISO_3310_1_R20_3 = ISO_3310_1_R20_3.map((i) => ISO_3310_1_sieves[i]);
/*List containing all of the individual :py:func:`Sieve` objects, on the
ISO 3310-1:2016 R20/3 series only, ordered from largest  openings to smallest.

References
----------
.. [1] ISO 3310-1:2016 - Test Sieves -- Technical Requirements and Testing
   -- Part 1: Test Sieves of Metal Wire Cloth.
*/

ISO_3310_1_R20 = ['125', '112', '100', '90', '80', '71', '63', '56', '50', '45', '40', '35.5', '31.5', '28', '25', '22.4', '20', '18', '16', '14', '12.5', '11.2', '10', '9', '8', '7.1', '6.3', '5.6', '5', '4.5', '4', '3.55', '3.15', '2.8', '2.5', '2.24', '2', '1.8', '1.6', '1.4', '1.25', '1.12', '1', '0.9', '0.8', '0.71', '0.63', '0.56', '0.5', '0.45', '0.4', '0.355', '0.315', '0.28', '0.25', '0.224', '0.2', '0.18', '0.16', '0.14', '0.125', '0.112', '0.1', '0.09', '0.08', '0.071', '0.063', '0.056', '0.05', '0.045', '0.04', '0.036'];
ISO_3310_1_R20 = ISO_3310_1_R20.map((i) => ISO_3310_1_sieves[i])
/*List containing all of the individual :py:func:`Sieve` objects, on the
ISO 3310-1:2016 R20 series only, ordered from largest  openings to smallest.

References
----------
.. [1] ISO 3310-1:2016 - Test Sieves -- Technical Requirements and Testing
   -- Part 1: Test Sieves of Metal Wire Cloth.
*/

ISO_3310_1_R40_3 = ['125', '106', '90', '75', '63', '53', '45', '37.5', '31.5', '26.5', '22.4', '19', '16', '13.2', '11.2', '9.5', '8', '6.7', '5.6', '4.75', '4', '3.35', '2.8', '2.36', '2', '1.7', '1.4', '1.18', '1', '0.85', '0.71', '0.6', '0.5', '0.425', '0.355', '0.3', '0.25', '0.212', '0.18', '0.15', '0.125', '0.106', '0.09', '0.075', '0.063', '0.053', '0.045', '0.038'];
ISO_3310_1_R40_3 = ISO_3310_1_R40_3.map((i) => ISO_3310_1_sieves[i])
/*List containing all of the individual :py:func:`Sieve` objects, on the
ISO 3310-1:2016 R40/3 series only, ordered from largest  openings to smallest.

References
----------
.. [1] ISO 3310-1:2016 - Test Sieves -- Technical Requirements and Testing
   -- Part 1: Test Sieves of Metal Wire Cloth.
*/

ISO_3310_1_R10 = ['0.036', '0.032', '0.025', '0.02'];
ISO_3310_1_R10 = ISO_3310_1_R10.map((i) => ISO_3310_1_sieves[i])
/*List containing all of the individual :py:func:`Sieve` objects, on the
ISO 3310-1:2016 R10 series only, ordered from largest  openings to smallest.

References
----------
.. [1] ISO 3310-1:2016 - Test Sieves -- Technical Requirements and Testing
   -- Part 1: Test Sieves of Metal Wire Cloth.
*/

sieve_spacing_options = {'ISO 3310-1': ISO_3310_1_sieve_list,
                         'ISO 3310-1 R20': ISO_3310_1_R20,
                         'ISO 3310-1 R20/3': ISO_3310_1_R20_3,
                         'ISO 3310-1 R40/3': ISO_3310_1_R40_3,
                         'ISO 3310-1 R10': ISO_3310_1_R10,
                         'ASTM E11': ASTM_E11_sieve_list,};
export function psd_spacing({d_min=null, d_max=null, pts=20, method='logarithmic'}) {
    if( d_min !== null ) {
        let d_min = float(d_min);
    }
    if( d_max !== null ) {
        let d_max = float(d_max);
    }
    if( method === 'logarithmic' ) {
        return logspace(Math.log10(d_min), Math.log10(d_max), pts);
    } else if( method === 'linear' ) {
        return linspace(d_min, d_max, pts);
} else if( method[0] in ['R', 'r'] ) {
        let ratio = 10**(1.0/float(method.slice(1 )));
        if( d_min !== null && d_max !== null ) {
            throw new Error( 'ValueError','For geometric (Renard) series, only one of `d_min` and `d_max` should be provided' );
        }
        if( d_min !== null ) {
            let ds = [d_min];
            for( let i=0; i < pts-1; i++ ) {
                ds.push(ds[ds.length - 1]*ratio);
            }
            return ds;
        } else if( d_max !== null ) {
            ds = [d_max];
            for( let i=0; i < pts-1; i++ ) {
                ds.push(ds[ds.length-1]/ratio);
            }
            return list(reversed(ds));
}
} else if( method in sieve_spacing_options ) {
        let l = sieve_spacing_options[method];
        ds = [];
        for( let sieve of l ) {
           if(  d_min <= sieve.opening <= d_max ) {
               ds.push(sieve.opening);
            }
        }
        return list(reversed(ds));
} else {
        throw new Error( 'ValueError','Method not recognized' );
    }


}
export function pdf_lognormal({d, d_characteristic, s}) {
    try {
        let log_term = Math.log(d/d_characteristic)/s;
    } catch( e ) /* ValueError */ {
        return 0.0;
    }
    return 1./(d*s*ROOT_TWO_PI)*Math.exp(-0.5*log_term*log_term);
}


export function cdf_lognormal({d, d_characteristic, s}) {
    try {
        return 0.5*(1.0 + erf((Math.log(d/d_characteristic))/(s*Math.sqrt(2.0))));
    } catch( e ) {
        // math error at cdf = 0 (x going as low as possible)
        return 0.0;
    }


}
export function pdf_lognormal_basis_integral({d, d_characteristic, s, n}) {
    try {
        let s2 = s*s;
        let t0 = Math.exp(s2*n*n*0.5);
        let d_ratio = d/d_characteristic;
        let t1 = (d/(d_ratio))**n;
        let t2 = erf((s2*n - Math.log(d_ratio))/(Math.sqrt(2.)*s));
        return -0.5*t0*t1*t2;
    } catch( e ) /* [OverflowError, ZeroDivisionError, ValueError] */ {
        return pdf_lognormal_basis_integral( {d: 1E-80, d_characteristic: d_characteristic, s: s, n: n });
    }


}
export function pdf_Gates_Gaudin_Schuhman({d, d_characteristic, m}) {
    if( d <= d_characteristic ) {
        return m/d*(d/d_characteristic)**m;
    } else {
        return 0.0;
    }


}
export function cdf_Gates_Gaudin_Schuhman({d, d_characteristic, m}) {
    if( d <= d_characteristic ) {
        return (d/d_characteristic)**m;
    } else {
        return 1.0;
    }


}
export function pdf_Gates_Gaudin_Schuhman_basis_integral({d, d_characteristic, m, n}) {
    return m/(m+n)*d**n*(d/d_characteristic)**m;
}


export function pdf_Rosin_Rammler({d, k, m}) {
    return d**(m - 1.0)*k*m*Math.exp(-(d**m)*k);
}


export function cdf_Rosin_Rammler({d, k, m}) {
    return 1.0 - Math.exp(-k*(d**m));
}


export function pdf_Rosin_Rammler_basis_integral({d, k, m, n}) {
    // Also not able to compute the limit for d approaching 0.
    try {
        let a = (m + n)/m;
        let x = d**m*k;
        let t1 = float(gamma(a))*float(gammaincc(a, x));
        return (-(d**(m+n))*k*(d**m*k)**(-a))*t1;
    } catch( e ) /* [OverflowError, ZeroDivisionError] */ {
        if( d === 1E-40 ) {
            throw new Error( 'e' );
        }
        return pdf_Rosin_Rammler_basis_integral(1E-40, k, m, n);
    }


}
names = {0: 'Number distribution', 1: 'Length distribution',
         2: 'Area distribution', 3: 'Volume/Mass distribution'};
export function _label_distribution_n(n) {  // pragma: no cover
    if( n in names ) {
        return names[n];
    } else {
        return stringInterpolate( 'Order %s distribution',str(n) );
    }

}
let _mean_size_docstring = '_mean_size_docstring';
let _mean_size_iso_docstring = '_mean_size_iso_docstring';
 class ParticleSizeDistributionContinuous extends object {
    _pdf_basis_integral_definite( d_min, d_max, n) {
        // Needed as an api for numerical integrals
        return (this._pdf_basis_integral( {d: d_max, n: n })
                - this._pdf_basis_integral( {d: d_min, n: n }));
    }

    pdf( d, n=null) {
        let ans = this._pdf(d=d);
        if( n !== null && n !== this.order ) {
            let power = n - this.order;
            let numerator = d**power*ans;
            let denominator = this._pdf_basis_integral_definite( {d_min: 0.0, d_max: this.d_excessive, n: power });
            ans = numerator/denominator;
        }
        ans = Math.max(ans, 0.0);
        if( this.truncated ) {
            if( d < this.d_min || d > this.d_max ) {
                return 0.0;
            }
            ans = (ans)/(this._cdf_d_max - this._cdf_d_min);
        }
        return ans;
    }

    cdf( d, n=null) {
        if( n !== null && n !== this.order ) {
            let power = n - this.order;
            // One of the pdf_basis_integral calls could be saved except for
            // support for numerical integrals
            let numerator = this._pdf_basis_integral_definite( {d_min: 0.0, d_max: d, n: power });
            let denominator = this._pdf_basis_integral_definite( {d_min: 0.0, d_max: this.d_excessive, n: power });
            let ans =  Math.max(numerator/denominator, 0.0);
        } else {
            ans = Math.max(this._cdf(d=d), 0.0);
        }
        if( this.truncated ) {
            if( d <= this.d_min ) {
                return 0.0;
            } else if( d >= this.d_max ) {
                return 1.0;
}
            ans = (ans - this._cdf_d_min)/(this._cdf_d_max - this._cdf_d_min);
        }
        return ans;
    }

    delta_cdf( d_min, d_max, n=null) {
        return this.cdf(d_max, { n: n }) - this.cdf(d_min, { n: n });
    }

    dn( fraction, n=null) {
        if( fraction === 1.0 ) {
            // Avoid returning the maximum value of the search interval
            let fraction = 1.0 - epsilon;
        }
        if( fraction < 0 ) {
            throw new Error( 'ValueError','Fraction must be more than 0' );
        } else if( fraction === 0 ) {  // pragma: no cover
            if( this.truncated ) {
                return this.d_min;
            }
            return 0.0;
}
            // Solve to float prevision limit - works well, but is there a real
            // point when with mpmath it would never happen?
            // dist.cdf(dist.dn(0)-1e-35) == 0
            // dist.cdf(dist.dn(0)-1e-36) == input
            // dn(0) == 1.9663615597466143e-20
//            def err(d):
//                cdf = self.cdf(d, n=n)
//                if cdf == 0:
//                    cdf = -1
//                return cdf
//            return brenth(err, self.d_minimum, self.d_excessive, maxiter=1000, xtol=1E-200)

 else if( fraction > 1 ) {
            throw new Error( 'ValueError','Fraction less than 1' );
}
        // As the dn may be incredibly small, it is required for the absolute
        // tolerance to not be happy - it needs to continue iterating as long
        // as necessary to pin down the answer
        return brenth((d) => {this.cdf(d, { n: n }) -fraction},
                      this.d_minimum, this.d_excessive, { maxiter: 1000, xtol: 1E-200 });
    }

    ds_discrete( d_min=null, d_max=null, pts=20, limit=1e-9,
                    method='logarithmic') {
        if( ['R', 'r'].indexOf(method[0]) == -1 ) {
            if( d_min === null ) {
                let d_min = this.dn(limit);
            }
            if( d_max === null ) {
                let d_max = this.dn(1.0 - limit);
            }
        }
        return psd_spacing( {d_min: d_min, d_max: d_max, pts: pts, method: method });
    }

    fractions_discrete( ds, n=null) {
        let cdfs = ds.map( d =>this.cdf(d, { n: n }) );
        return [cdfs[0]] + diff(cdfs);
    }

    cdf_discrete( ds, n=null) {
        return ds.map( d =>this.cdf(d, { n: n }) );
    }

    mean_size( p, q) {
        /*
        >>> psd = PSDLognormal(s=0.5, d_characteristic=5E-6)
        >>> psd.mean_size(3, 2)
        4.412484512922977e-06

        Note that for the case where p == q, a different set of formulas are
        required - which do not have analytical results for many distributions.
        Therefore, a close numerical approximation is used instead, to
        perturb the values of p and q so they are 1E-9 away from each other.
        This leads only to slight errors, as in the example below where the
        correct answer is 5E-6.

        >>> psd.mean_size(3, 3)
        4.9999999304923345e-06
        */
        if( p === q ) {
            p -= 1e-9;
            q += 1e-9;
        }
        let pow1 = q - this.order;

        let denominator = this._pdf_basis_integral_definite( {d_min: this.d_minimum, d_max: this.d_excessive, n: pow1 });
        let root_power = p - q;
        let pow3 = p - this.order;
        let numerator = this._pdf_basis_integral_definite( {d_min: this.d_minimum, d_max: this.d_excessive, n: pow3 });
        return (numerator/denominator)**(1.0/(root_power));
    }

    mean_size_ISO( k, r) {
        /*
        >>> psd = PSDLognormal(s=0.5, d_characteristic=5E-6)
        >>> psd.mean_size_ISO(1, 2)
        4.412484512922977e-06
        */
        let p = k + r;
        let q = r;
        return this.mean_size( {p: p, q: q });
    }

    // @property
    vssa() {
        return 6/this.mean_size(3, 2);
    }


    plot_pdf( n=[0, 1, 2, 3], d_min=null, d_max=null, pts=500,
                 normalized=false, method='linear') {  // pragma: no cover
        try {
            const plt = require( './matplotlib/pyplot' );
        } catch( e ) {  // pragma: no cover
            throw new Error( 'ValueError',NO_MATPLOTLIB_MSG );
        }
        let ds = this.ds_discrete( {d_min: d_min, d_max: d_max, pts: pts, method: method });
        try {
            for( let ni of n ) {
                let fractions = ds.map( d =>this.pdf(d, { n: ni }) );
                if( normalized ) {
                    fractions = normalize(fractions);
                }
                plt.semilogx(ds, fractions, { label: _label_distribution_n(ni) });
            }
        } catch( e ) /* Exception */ {
            fractions = ds.map( d =>this.pdf(d, { n: n }) );
            if( normalized ) {
                fractions = normalize(fractions);
            }
            plt.semilogx(ds, fractions, { label: _label_distribution_n(n) });
        }
        plt.ylabel('Probability density function, [-]');
        plt.xlabel('Particle diameter, [m]');
        plt.title(stringInterpolate( 'Probability density function of %s distribution with parameters %s',[this.name, this.parameters] ));
        plt.legend();
        plt.show();
        return fractions;
    }

    plot_cdf( n=[0, 1, 2, 3], d_min=null, d_max=null, pts=500, method='logarithmic') {   // pragma: no cover
        try {
            const plt = require( './matplotlib/pyplot' );
        } catch( e ) {  // pragma: no cover
            throw new Error( 'ValueError',NO_MATPLOTLIB_MSG );
        }

        let ds = this.ds_discrete( {d_min: d_min, d_max: d_max, pts: pts, method: method });
        try {
            for( let ni of n ) {
                let cdfs = this.cdf_discrete( {ds: ds, n: ni });
                plt.semilogx(ds, cdfs, { label: _label_distribution_n(ni) });
            }
        } catch( e ) {
            cdfs = this.cdf_discrete( {ds: ds, n: n });
            plt.semilogx(ds, cdfs, { label: _label_distribution_n(n) });
        }
        if( this.points ) {
            plt.plot(this.ds, this.fraction_cdf, '+', { label: 'Volume/Mass points' });

            if( hasAttr(self, 'area_fractions') ) {
                plt.plot(this.ds, cumsum(this.area_fractions), '+', { label: 'Area points' });
            }
            if( hasAttr(self, 'length_fractions') ) {
                plt.plot(this.ds, cumsum(this.length_fractions), '+', { label: 'Length points' });
            }
            if( hasAttr(self, 'number_fractions') ) {
                plt.plot(this.ds, cumsum(this.number_fractions), '+', { label: 'Number points' });
            }
        }
        plt.ylabel('Cumulative density function, [-]');
        plt.xlabel('Particle diameter, [m]');
        plt.title(stringInterpolate( 'Cumulative density function of %s distribution with parameters %s',[this.name, this.parameters] ));
        plt.legend();
        plt.show();
    }


}
 class ParticleSizeDistribution extends ParticleSizeDistributionContinuous {
    toString() {
        let txt = '<Particle Size Distribution, points=%d, D[3, 3]=%f m>';
        return stringInterpolate( txt,[this.N, this.mean_size( {p: 3, q: 3 })] );
    }

    size_classes = false;
    _interpolated = null;
    points = true;
    truncated = false;
    name = 'Discrete';
    constructor( ds, fractions, cdf=false, order=3, monotonic=true) {
        this.monotonic = monotonic;
        this.ds = ds;
        this.order = order;

        if( ds !== null && (len(ds) === len(fractions) + 1) ) {
            this.size_classes = true;
        } else {
            this.size_classes = false;
        }

        if( cdf ) {
            // Convert a cdf to fraction set
            if( len(fractions)+1 === len(ds) ) {
                let fractions = [fractions[0]] + diff(fractions);
            } else {
                fractions = diff(fractions);
                fractions.insert(0, 0.0);
            }
        } else if( sum(fractions) !== 1.0 ) {
            // Normalize flow inputs
            let tot_inv = 1.0/sum(fractions);
            fractions = fractions.map( i => i !== 0.0 ? i*tot_inv : 0.0 );
}

        this.N = len(fractions);

        // This will always be in base-3 basis
        if( this.order !== 3 ) {
            let power = 3 - this.order;
            let d3s = range(this.N).map( i =>this.di_power(i, { power: power })*fractions[i] );
            let tot_d3 = sum(d3s);
            this.fractions = d3s.map( i =>i/tot_d3 );
        } else {
            this.fractions = fractions;
        }
        // Set the number fractions
        let D3s = range(this.N).map( i =>this.di_power(i, { power: 3 }) );
        let numbers = listZip(this.fractions, D3s).map( ( [ Vi, Vp ] ) =>Vi/Vp );
        let number_sum = sum(numbers);
        this.number_fractions = numbers.map( i =>i/number_sum );

        // Set the length fractions
        D3s = range(this.N).map( i =>this.di_power(i, { power: 2 }) );
        numbers = listZip(this.fractions, D3s).map( ( [ Vi, Vp ] ) =>Vi/Vp );
        number_sum = sum(numbers);
        this.length_fractions = numbers.map( i =>i/number_sum );

        // Set the surface area fractions
        D3s = range(this.N).map( i =>this.di_power(i, { power: 1 }) );
        numbers = listZip(this.fractions, D3s).map( ( [ Vi, Vp ] ) =>Vi/Vp );
        number_sum = sum(numbers);
        this.area_fractions = numbers.map( i =>i/number_sum );


        // Things for interoperability with the Continuous distribution
        this.d_excessive = this.ds[this.ds.length-1];
        this.d_minimum = 0.0;
        this.parameters = {};
        this.order = 3;
        this.fraction_cdf = this.volume_cdf = cumsum(this.fractions);
        this.area_cdf = cumsum(this.area_fractions);
        this.length_cdf = cumsum(this.length_fractions);
        this.number_cdf = cumsum(this.number_fractions);
    }

    // @property
    interpolated() {
        if( !this._interpolated ) {
            this._interpolated = PSDInterpolated( {ds: this.ds,
                                                 fractions: this.fractions,
                                                 order: 3,
                                                 monotonic: this.monotonic });
        }
        return this._interpolated;
    }

    _pdf( d) {
        return this.interpolated._pdf(d);
    }

    _cdf( d) {
        return this.interpolated._cdf(d);
    }

    _pdf_basis_integral( d, n) {
        return this.interpolated._pdf_basis_integral(d, n);
    }

    _fit_obj_function( vals, distribution, n) {
        let err = 0.0;
        let dist = distribution(...list(vals));
        let l = this.size_classes ? len(this.fractions) : len(this.fractions) - 1;
        for( let i; i<l; i++ ) {
            let delta_cdf = dist.delta_cdf( {d_min: this.ds[i], d_max: this.ds[i+1] });
            err += Math.abs(delta_cdf - this.fractions[i]);
        }
        return err;
    }

    fit( x0=null, distribution='lognormal', n=null, ...kwargs) {
        /*Incomplete method to fit experimental values to a curve.

        It is very hard to get good initial guesses, which are really required
        for this. Differential evolution is promising. This API is likely to
        change in the future.
        */
        let dist = {'lognormal': PSDLognormal,
                'GGS': PSDGatesGaudinSchuhman,
                'RR': PSDRosinRammler}[distribution];

        if( distribution === 'lognormal' ) {
            if( x0 === null ) {
                let d_characteristic = sum( listZip(this.fractions, this.Dis).map( ( [ fi, di ] ) =>fi*di ));
                let s = 0.4;
                let x0 = [d_characteristic, s];
            }
        } else if( distribution === 'GGS' ) {
            if( x0 === null ) {
                d_characteristic = sum( listZip(this.fractions, this.Dis).map( ( [ fi, di ] ) =>fi*di ));
                let m = 1.5;
                x0 = [d_characteristic, m];
            }
}
 else if( distribution === 'RR' ) {
            if( x0 === null ) {
                x0 = [5E-6, 1e-2];
            }
}
const { minimize } = require( './scipy.optimize' );
        return minimize(this._fit_obj_function, x0, [dist, n], ...kwargs);
    }

    // @property
    Dis() {
        /*Representative diameters of each bin.*/
        return range(this.N).map( i =>this.di_power(i, { power: 1 }) );
    }

    di_power( i, power=1) {
        if( this.size_classes ) {
            let rt = power + 1;
            return ((self.ds[i+1]**rt - self.ds[i]**rt)/((this.ds[i+1] - this.ds[i])*rt));
        } else {
            return self.ds[i]**power;
        }

    }
    mean_size( p, q) {
        /*
        >>> import numpy as np
        >>> ds = 1E-6*np.array([240, 360, 450, 562.5, 703, 878, 1097, 1371, 1713, 2141, 2676, 3345, 4181, 5226, 6532])
        >>> numbers = [65, 119, 232, 410, 629, 849, 990, 981, 825, 579, 297, 111, 21, 1]
        >>> psd = ParticleSizeDistribution(ds=ds, fractions=numbers, order=0)
        >>> psd.mean_size(3, 2)
        0.002269321031745045
        */
        if( p !== q ) {
            // Note: D(p, q) = D(q, p); in ISO and proven experimentally
            let numerator = sum(this.di_power( {i: i, power: p })*range(this.N).map( i => this.number_fractions[i]));
            let denominator = sum(this.di_power( {i: i, power: q })*range(this.N).map( i => this.number_fractions[i]));
            return (numerator/denominator)**(1.0/(p-q));
        } else {
            numerator = sum(Math.log(this.di_power( {i: i, power: 1 }))*this.di_power( {i: i, power: p })*range(this.N).map( i => this.number_fractions[i]));
            denominator = sum(this.di_power( {i: i, power: q })*range(this.N).map( i => this.number_fractions[i]));
            return Math.exp(numerator/denominator);
        }

    }
    mean_size_ISO( k, r) {
        let p = k + r;
        let q = r;
        return this.mean_size( {p: p, q: q });
    }

    // @property
    vssa() {
        let ds = this.Dis;
        let Vs = ds.map( di =>Math.PI/6*di**3 );
        let SAs = ds.map( di =>Math.PI*di**2 );
        let SASs = listZip(SAs, Vs).map( ( [ SA, V ] ) =>SA/V );
        let VSSA = sum( listZip(this.fractions, SASs).map( ( [ fi, SASi ] ) =>fi*SASi ));
        return VSSA;
    }

}
// try:  // pragma: no cover
//     // Python 2
//     ParticleSizeDistributionContinuous.mean_size.__func__.__doc__ = _mean_size_docstring %(ParticleSizeDistributionContinuous.mean_size.__func__.__doc__);
//     ParticleSizeDistributionContinuous.mean_size_ISO.__func__.__doc__ = _mean_size_iso_docstring %(ParticleSizeDistributionContinuous.mean_size_ISO.__func__.__doc__);
//     ParticleSizeDistribution.mean_size.__func__.__doc__ = _mean_size_docstring %(ParticleSizeDistribution.mean_size.__func__.__doc__);
//     ParticleSizeDistribution.mean_size_ISO.__func__.__doc__ = _mean_size_iso_docstring %(ParticleSizeDistribution.mean_size_ISO.__func__.__doc__);
// except AttributeError:  // pragma: no cover
//     try:
//         // Python 3
//         ParticleSizeDistributionContinuous.mean_size.__doc__ = _mean_size_docstring %(ParticleSizeDistributionContinuous.mean_size.__doc__);
//         ParticleSizeDistributionContinuous.mean_size_ISO.__doc__ = _mean_size_iso_docstring %(ParticleSizeDistributionContinuous.mean_size_ISO.__doc__);
//         ParticleSizeDistribution.mean_size.__doc__ = _mean_size_docstring %(ParticleSizeDistribution.mean_size.__doc__);
//         ParticleSizeDistribution.mean_size_ISO.__doc__ = _mean_size_iso_docstring %(ParticleSizeDistribution.mean_size_ISO.__doc__);
//     except:
//         /* pass */ // micropython
// delete _mean_size_iso_docstring;
// delete _mean_size_docstring;
 class PSDLognormal extends ParticleSizeDistributionContinuous {
    name = 'Lognormal';
    points = false;
    truncated = false;
    constructor( d_characteristic, s, order=3, d_min=null, d_max=null) {
        this.s = s;
        this.d_characteristic = d_characteristic;
        this.order = order;
        this.parameters = {'s': s, 'd_characteristic': d_characteristic,
                           'd_min': d_min, 'd_max': d_max};
        this.d_min = d_min;
        this.d_max = d_max;
        // Pick an upper bound for the search algorithm of 15 orders of magnitude larger than
        // the characteristic diameter; should never be a problem, as diameters can only range
        // so much, physically.
        if( this.d_max !== null ) {
            this.d_excessive = this.d_max;
        } else {
            this.d_excessive = 1E15*this.d_characteristic;
        }
        if( this.d_min !== null ) {
            this.d_minimum = this.d_min;
        } else {
            this.d_minimum = 0.0;
        }

        if( this.d_min !== null || this.d_max !== null ) {
            this.truncated = true;
            if( this.d_max === null ) {
                this.d_max = this.d_excessive;
            }
            if( this.d_min === null ) {
                this.d_min = 0.0;
            }
            this._cdf_d_max = this._cdf(this.d_max);
            this._cdf_d_min = this._cdf(this.d_min);
        }
    }
    _pdf( d) {
        return pdf_lognormal(d, { d_characteristic: this.d_characteristic, s: this.s });
    }

    _cdf( d) {
        return cdf_lognormal(d, { d_characteristic: this.d_characteristic, s: this.s });
    }

    _pdf_basis_integral( d, n) {
        return pdf_lognormal_basis_integral(d, { d_characteristic: this.d_characteristic, s: this.s, n: n });
    }


}
 class PSDGatesGaudinSchuhman extends ParticleSizeDistributionContinuous {
    name = 'Gates Gaudin Schuhman';
    points = false;
    truncated = false;
    constructor( d_characteristic, m, order=3, d_min=null, d_max=null) {
        this.m = m;
        this.d_characteristic = d_characteristic;
        this.order = order;
        this.parameters = {'m': m, 'd_characteristic': d_characteristic,
                           'd_min': d_min, 'd_max': d_max};

        if( this.d_max !== null ) {
            // PDF above this is zero
            this.d_excessive = this.d_max;
        } else {
            this.d_excessive = this.d_characteristic;
        }
        if( this.d_min !== null ) {
            this.d_minimum = this.d_min;
        } else {
            this.d_minimum = 0.0;
        }

        if( this.d_min !== null || this.d_max !== null ) {
            this.truncated = true;
            if( this.d_max === null ) {
                this.d_max = this.d_excessive;
            }
            if( this.d_min === null ) {
                this.d_min = 0.0;
            }
            this._cdf_d_max = this._cdf(this.d_max);
            this._cdf_d_min = this._cdf(this.d_min);
        }
    }
    _pdf( d) {
        return pdf_Gates_Gaudin_Schuhman(d, { d_characteristic: this.d_characteristic, m: this.m });
    }

    _cdf( d) {
        return cdf_Gates_Gaudin_Schuhman(d, { d_characteristic: this.d_characteristic, m: this.m });
    }

    _pdf_basis_integral( d, n) {
        return pdf_Gates_Gaudin_Schuhman_basis_integral(d, { d_characteristic: this.d_characteristic, m: this.m, n: n });
    }


}
 class PSDRosinRammler extends ParticleSizeDistributionContinuous {
    name = 'Rosin Rammler';
    points = false;
    truncated = false;
    constructor( k, m, order=3, d_min=null, d_max=null) {
        this.m = m;
        this.k = k;
        this.order = order;
        this.parameters = {'m': m, 'k': k, 'd_min': d_min, 'd_max': d_max};

        if( this.d_max !== null ) {
            this.d_excessive = this.d_max;
        } else {
            this.d_excessive = 1e15; // TODO
        }
        if( this.d_min !== null ) {
            this.d_minimum = this.d_min;
        } else {
            this.d_minimum = 0.0;
        }

        if( this.d_min !== null || this.d_max !== null ) {
            this.truncated = true;
            if( this.d_max === null ) {
                this.d_max = this.d_excessive;
            }
            if( this.d_min === null ) {
                this.d_min = 0.0;
            }
            this._cdf_d_max = this._cdf(this.d_max);
            this._cdf_d_min = this._cdf(this.d_min);
        }
    }
    _pdf( d) {
        return pdf_Rosin_Rammler(d, { k: this.k, m: this.m });
    }

    _cdf( d) {
        return cdf_Rosin_Rammler(d, { k: this.k, m: this.m });
    }

    _pdf_basis_integral( d, n) {
        return pdf_Rosin_Rammler_basis_integral(d, { k: this.k, m: this.m, n: n });
    }


}
/*# These are all brutally slow!
from scipy.stats import *
from fluids import *
distribution = lognorm(s=0.5, scale=5E-6)
psd = PSDCustom(distribution)

# psd.dn(0.5, n=2.0) # Doesn't work at all, but the main things do including plots
*/
 class PSDCustom extends ParticleSizeDistributionContinuous {
    name = '';
    points = false;
    truncated = false;
    constructor( distribution, order=3.0, d_excessive=1.0, name=null,
                 d_min=null, d_max=null) {
        if( name ) {
            this.name = name;
        } else {
            try {
                this.name = distribution.dist.__class__.__name__;
            } catch( e ) {
                /*  */
            }
        }
        try {
            this.parameters = dict(distribution.kwds);
            this.parameters.update({'d_min': d_min, 'd_max': d_max});
        } catch( e ) {
            this.parameters = {'d_min': d_min, 'd_max': d_max};
        }

        this.distribution = distribution;
        this.order = order;
        this.d_max = d_max;
        this.d_min = d_min;

        if( this.d_max !== null ) {
            this.d_excessive = this.d_max;
        } else {
            this.d_excessive = d_excessive;
        }
        if( this.d_min !== null ) {
            this.d_minimum = this.d_min;
        } else {
            this.d_minimum = 0.0;
        }

        if( this.d_min !== null || this.d_max !== null ) {
            this.truncated = true;
            if( this.d_max === null ) {
                this.d_max = this.d_excessive;
            }
            if( this.d_min === null ) {
                this.d_min = 0.0;
            }
            this._cdf_d_max = this._cdf(this.d_max);
            this._cdf_d_min = this._cdf(this.d_min);
        }
    }
    _pdf( d) {
        return this.distribution.pdf(d);
    }

    _cdf( d) {
        return this.distribution.cdf(d);
    } 

    _pdf_basis_integral_definite( d_min, d_max, n) {
        // Needed as an api for numerical integrals
        n = float(n);
        if( d_min === 0 ) { let d_min = d_max*1E-12; }
        if( n === 0 ) { let to_int = d => this._pdf(d); }
        else if( n === 1 ) { to_int = d => d*this._pdf(d); }
        else if( n === 2 ) { to_int = d => d*d*this._pdf(d); }
        else if( n === 3 ) { to_int = d => d*d*d*this._pdf(d); }
        else { to_int = d => d**n*this._pdf(d); }

//        points = logspace(Math.log10(max(d_max*1e-3, d_min)), Math.log10(d_max*.999), 40)
        let points = [d_max*1e-3]; // d_min*.999 d_min
        return float(quad(to_int, d_min, d_max, { points: points })[0]); //
    }


}
// TODO: translate scipy function to JS
//  class PSDInterpolated extends ParticleSizeDistributionContinuous {
//     name = 'Interpolated';
//     points = true;
//     truncated = false;
//     constructor( ds, fractions, order=3, monotonic=true) {
//         this.order = order;
//         this.monotonic = monotonic;
//         this.parameters = {};

//         let ds = list(ds);
//         let fractions = list(fractions);

//         if( len(ds) === len(fractions)+1 ) {
//             // size classes, the last point will be zero
//             fractions.insert(0, 0.0);
//             this.d_minimum = min(ds);
//         } else if( ds[0] !== 0 ) {
//             ds = [0] + ds;
//             if( len(ds) !== len(fractions) ) {
//                 fractions = [0] + fractions;
//             }
//             this.d_minimum = 0.0;
// }

//         this.ds = ds;
//         this.fractions = fractions;

//         this.d_excessive = Math.max(ds);


//         this.fraction_cdf = cumsum(fractions);
//         if( this.monotonic ) {
//             const { PchipInterpolator } = require( './scipy.interpolate' );
//             let globals()['PchipInterpolator'] = PchipInterpolator;

//             this.cdf_spline = PchipInterpolator(ds, this.fraction_cdf, { extrapolate: true });
//             this.pdf_spline = PchipInterpolator(ds, this.fraction_cdf, { extrapolate: true }).derivative(1);
//         } else {
//             const { UnivariateSpline } = require( './scipy.interpolate' );
//             globals()['UnivariateSpline'] = UnivariateSpline;

//             this.cdf_spline = UnivariateSpline(ds, this.fraction_cdf, { ext: 3, s: 0 });
//             this.pdf_spline = UnivariateSpline(ds, this.fraction_cdf, { ext: 3, s: 0 }).derivative(1);
//         }

//         // The pdf basis integral splines will be stored here
//         this.basis_integrals = {};
//     }


//     _pdf( d) {
//         return Math.max(0.0, float(this.pdf_spline(d)));
//     }

//     _cdf( d) {
//         if( d > this.d_excessive ) {
//             // Handle spline values past 1 that decrease to zero
//             return 1.0;
//         }
//         return Math.max(0.0, float(this.cdf_spline(d)));
//     }

//     _pdf_basis_integral( d, n) {
//         // there are slight errors with this approach - but they are OK to
//         // ignore.
//         // DO NOT evaluate the first point as it leads to inf values; just set
//         // it to zero
//         from fluids.numerics import numpy as np;
//         if( n not in this.basis_integrals ) {
//             let ds = np.array(this.ds.slice(1 ));
//             let pdf_vals = this.pdf_spline(ds);
//             let basis_integral = ds**n*pdf_vals;
//             if( this.monotonic ) {
//                 const { PchipInterpolator } = require( './scipy.interpolate' );
//                 this.basis_integrals[n] = PchipInterpolator(ds, basis_integral, { extrapolate: true }).antiderivative(1);
//             } else {
//                 const { UnivariateSpline } = require( './scipy.interpolate' );
//                 this.basis_integrals[n] = UnivariateSpline(ds, basis_integral, { ext: 3, s: 0 }).antiderivative(n=1);
//             }
//         }
//         return Math.max(float(this.basis_integrals[n](d)), 0.0);
//     }



// }
