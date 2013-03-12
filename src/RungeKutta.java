/**
 * Created with IntelliJ IDEA.
 * User: timopheym
 * Date: 16.05.12
 * Time: 17:58
 * To change this template use File | Settings | File Templates.
 */
public class RungeKutta {public static void main(String[] args) {
    int k = 2;
    double Xo, Yo, Y1, Zo, Z1;
    double k1, k2, k4, k3, h;
    double q1, q2, q4, q3;
    /*
    *Начальные условия
    */
    Xo = 0;
    Yo = 0.8;
    Zo = 2;

    h = 0.1; // шаг

    System.out.println("\tX\t\tY\t\tZ");
    for(; r(Xo,2)<1.0; Xo += h){

        k1 = f(Xo, Yo, Zo);
        q1 = g(Xo, Yo, Zo);

        k2 = f(Xo + h/2.0, Yo + (h*k1)/2.0, Zo + (h*q1)/2.0);
        q2 = g(Xo + h/2.0, Yo + (h*k1)/2.0, Zo + (h*q1)/2.0);

        k3 = f(Xo + h/2.0, Yo + (h*k2)/2.0, Zo + (h*q2)/2.0);
        q3 = g(Xo + h/2.0, Yo + (h*k2)/2.0, Zo + (h*q2)/2.0);

        k4 = f(Xo + h, Yo + h*k3, Zo + h*q3);
        q4 = g(Xo + h, Yo + h*k3, Zo + h*q3);

        Z1 = Zo + (h/6.0)*(k1 + 2.0*k2 + 2.0*k3 + k4);
        Y1 = Yo + (h/6.0)*(q1 + 2.0*q2 + 2.0*q3 + q4);
        System.out.println("\t" + r(Xo + h, k) + "\t\t" + r(Y1 ,k) + "\t\t" + r(Z1 ,k));
        Yo = Y1;
        Zo = Z1;
    }

}
    /**
     * функция для округления и отбрасывания "хвоста"
     */
    public static double r(double value, int k){
        return (double)Math.round((Math.pow(10, k)*value))/Math.pow(10, k);
    }
    /**
     * функции, которые получается из системы
     */
    public static double f(double x, double y, double z){
        return (Math.cos(3*x) - 4*y);
    }
    public static double g(double x, double y, double z){
        return (z);
    }
}
