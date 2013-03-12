import com.mongodb.*;
import org.bson.BSONDecoder;
import org.bson.BasicBSONCallback;
import org.bson.BasicBSONDecoder;
import org.bson.types.ObjectId;

import java.net.UnknownHostException;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: smena
 * Date: 16.05.12
 * Time: 3:14
 * To change this template use File | Settings | File Templates.
 */
public class emme {
    private static DBObject attrs;
    public static void main(String[] args) throws UnknownHostException {
        Mongo m = new Mongo();
        DB db = m.getDB( "emme" );
        DBCollection coll = db.getCollection("artels");
        BasicDBObject query = new BasicDBObject();
        ObjectId id = new ObjectId(args[0]);
        query.put("_id", id);
        DBObject obj = coll.findOne(query);
        attrs = (DBObject)obj.get("attrs");
        System.out.println(attrs);
        BasicDBList intervals = (BasicDBList)attrs.get("intervals");
        Double h = 0.1;
        Integer T = new Double((Double)attrs.get("T")).intValue();
        Integer hm = new Double((Double)attrs.get("h")).intValue();
        int k = 2;
        double Xo, Qo, So, Ro, Ko, Q1 = 0, R1  = 0, S1 = 0, K1 = 0;
        double q1, q2, q4, q3;
        double r1, r2, r4, r3;
        double s1, s2, s4, s3;
        double k1, k2, k4, k3;
        Double[] Q = new Double[T];
        Double[] R = new Double[T];
        Double[] S = new Double[T];
        Double[] K = new Double[T];
        Xo = 0;
        Qo = (Double) attrs.get("Q");
        Ro = (Double) attrs.get("R");
        So = (Double) attrs.get("S");
        Ko = (Double) attrs.get("K");
        DBObject interval;
        h = 0.1;
        double eq,er,es;
        double xq,xr,xs,xss;
        for (int i = 0; i < intervals.size(); i++) {
            interval = (DBObject)intervals.get(i);
            System.out.println(i+" <------in intervals");
            for(int t = new Double((Double)interval.get("start")).intValue();
                t < new Double((Double)interval.get("end")).intValue();
                t += hm){
                eq = parse(String.valueOf(interval.get("EQ")), t);
                er = parse(String.valueOf(interval.get("ER")), t);
                es = parse(String.valueOf(interval.get("ES")), t);

                xq  = parse(String.valueOf(interval.get("XQ")), t);
                xr  = parse(String.valueOf(interval.get("XR")), t);
                xs  = parse(String.valueOf(interval.get("XS")), t);
                xss = parse(String.valueOf(interval.get("XSS")), t);
                for(; r(Xo,2)<1.0; Xo += h){
                    q1 = yq(eq,Qo);
                    r1 = yr(er, Ro);
                    s1 = ys(es, So);
                    k1 = xt(es, Ko, q1, r1, s1, eq, er, es, xq, xr, xs, xss);

                    q2 = yq(eq,Qo + (h*q1)/2.0);
                    r2 = yr(er, Ro + (h * r1) / 2.0);
                    s2 = ys(es, So + (h * s1) / 2.0);
                    k2 = xt(es, Ko + (h * k1) / 2.0, q2, r2, s2, eq, er, es, xq, xr, xs, xss);

                    q3 = yq(eq,Qo + (h*q2)/2.0);
                    r3 = yr(er, Ro + (h * r2) / 2.0);
                    s3 = ys(es, So + (h * s2) / 2.0);
                    k3 = xt(es, Ko + (h * k2) / 2.0, q3, r3, s3, eq, er, es, xq, xr, xs, xss);

                    q4 = yq(eq,Qo + h*q3);
                    r4 = yr(er, Ro + h * r3);
                    s4 = ys(es, So + h * s3);
                    k4 = xt(es,Ko + h*k3,q4,r4,s4, eq, er, es, xq, xr, xs, xss);

                    Qo = Q1 = Qo + (h/6.0)*(q1 + 2.0*q2 + 2.0*q3 + q4);
                    Ro = R1 = Ro + (h/6.0)*(r1 + 2.0*r2 + 2.0*r3 + r4);
                    So = S1 = So + (h/6.0)*(s1 + 2.0*s2 + 2.0*s3 + s4);
                    Ko = K1 = Ko + (h/6.0)*(k1 + 2.0*k2 + 2.0*k3 + k4);
                }
                System.out.println(Qo+"  "+Ro+"  "+So+"  "+Ko+" <------in model");
                Q[t] =  Q1;
                R[t] =  S1;
                S[t] =  R1;
                K[t] =  K1;
            }
        }
        DBCollection results = db.getCollection("results");
        BasicDBObject result = new BasicDBObject();
        results.save(result);
        ObjectId resultId = results.get("_id");
    }

    public static double r(double value, int k){
        return (double)Math.round((Math.pow(10, k)*value))/Math.pow(10, k);
    }
    private static double parse(String func, int t){
        return Double.parseDouble(func);
    }
    private static double yq(double w1, double y1){
        return  w1-(Double) attrs.get("e3")*y1;
    }
    private static double yr(double w2, double y2){
        return  w2-(Double) attrs.get("e3")*y2;
    }
    private static double ys(double w3, double y3){
        return  w3-(Double) attrs.get("e3")*y3;
    }
    private static double xt(double w3, double xt, double y1, double y2, double y3
                           , double eq, double er, double es, double xq, double xr,
                             double xs, double xss){
        System.out.println((1-(Double)attrs.get("k1"))*
                ((Double)attrs.get("a")*(xq+xr)*y1*
                        ((Double)attrs.get("N")-y1*(xq+xr))
                        -(Double)attrs.get("b1")*xq*y1
                        -(Double)attrs.get("b2")*xr*y2
                        -(Double)attrs.get("b3")*xs*y3
                )-(1-(Double)attrs.get("k1")+(Double)attrs.get("k2"))*(xq+xr+xs)-xss-xq-xr-es-(Double)attrs.get("e0")*xt);
        return  (1-(Double)attrs.get("k1"))*
                ((Double)attrs.get("a")*(xq+xr)*y1*
                        ((Double)attrs.get("N")-y1*(xq+xr))
                        -(Double)attrs.get("b1")*xq*y1
                        -(Double)attrs.get("b2")*xr*y2
                        -(Double)attrs.get("b3")*xs*y3
                )-(1-(Double)attrs.get("k1")+(Double)attrs.get("k2"))*(xq+xr+xs)
                -xss-xq-xr-es-(Double)attrs.get("e0")*xt;
    }
}
