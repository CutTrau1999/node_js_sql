const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
// tao server
app.listen(PORT,function () {
    console.log("Server is running...");
});
//cofig cai file static
app.use(express.static("public"));
//config su dung ejs
app.set("view engine","ejs")

//config connect MSSQL
const mssql = require("mssql");
const config = {
    server:'cloud-apt.database.windows.net',
    database:'Development',
    user: "quanghoa",
    password: 'Studentaptech123'
}
mssql.connect(config,function (err) {
    if(err) console.log(err);
    else console.log("connect DB thanh cong");
});
// tao doi tuong de truy van du lieu
var db = new mssql.Request();
//trang chu
app.get("/search",function (req,res) {
    let key_search = "'%"+req.query.keyword+"%'";
    //lay du lieu
    db.query("SELECT * FROM Lab4_KhachHang WHERE TenKH LIKE"+key_search,function (err,rows) {
        if(err)
            res.send("Khong co ket qua");
        else
            res.render("home", {
                khs: rows.recordset
            })
    })
    //res.render("home");
});

app.get("/",function (req,res) {
    //lay du lieu
    db.query("SELECT * FROM Lab4_KhachHang",function (err,rows) {
        if(err)
            res.send("Khong co ket qua");
        else
            res.render("home", {
                khs: rows.recordset
            })
    })
    //res.render("home");
});

//link trả về form khách hàng
app.get("/them-khach-hang",function (req, res) {
    res.render("form")
})
//link nhận dữ liệu để thêm vào db
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
app.post("/luu-khach-hang",function (req, res) {
    let ten = req.body.TenKH;
    let dt = req.body.DienThoai;
    let dc = req.body.DiaChi;
    let sql_text = "INSERT INTO Lab4_KhachHang(TenKH,DienThoai,DiaChi) VALUES(N'"+ten+"','"+dt+"',N'"+dc+"')";
    db.query(sql_text,function (err,rows) {
        if(err) res.send(err);
        else res.redirect("/");
    })
})

app.get("/san-pham",function (req,res) {
    //lay du lieu
    db.query("SELECT * FROM Lab4_SanPham",function (err,rows) {
        if(err)
            res.send("Khong co ket qua");
        else
            res.render("sanpham", {
                khs: rows.recordset
            })
    })
    //res.render("home");
});
app.get("/them-san-pham",function (req, res) {
    res.render("form2")
})

app.use(bodyParser.urlencoded({extended:true}));
app.post("/luu-san-pham",function (req, res) {
    let tensp = req.body.TenSP;
    let mota = req.body.MoTa;
    let donvi = req.body.DonVi;
    let gia = req.body.Gia;
    let sql_text = "INSERT INTO Lab4_SanPham(TenSP,MoTa,DonVi,Gia) VALUES(N'"+tensp+"','"+mota+"',N'"+donvi+"',"+gia+")";
    db.query(sql_text,function (err,rows) {
        if(err) res.send(err);
        else res.redirect("/san-pham");
    })
})
//tao form nhap don hang
app.get("/tao-don-hang",function (req,res) {
    let sql_text = "SELECT * FROM Lab4_KhachHang; SELECT * FROM Lab4_SanPham";
    db.query(sql_text,function (err,rows) {
        if(err) res.send(err);
        else{
            res.render("donhang",{
                khs:rows.recordsets[0],
                sps:rows.recordsets[1],
            });
        }
    })
})

//nhan du lieu de tao don hang
app.post("/luu-don-hang",function (req,res) {
    let khID = req.body.KhachHangID;
    let spID = req.body.SanPhamID;
    let sql_text = "SELECT * FROM Lab4_SanPham WHERE ID IN ("+spID+");";
    db.query(sql_text,function (err,rows) {
        if(err) res.send(err)
        else{
            let sps = rows.recordset;
            let tongtien = 0;
            sps.map(function (e) {
                tongtien +=e.Gia;
            });
            let sql_text2 = "INSERT INTO Lab4_DonHang(KhachHangID,TongTien,ThoiGian) VALUES("+khID+","+tongtien+",GETDATE());SELECT SCOPE_IDENTITY() AS MaSo;"
            db.query(sql_text2,function (err,rows) {
                    let donhang = rows.recordsets[0];
                    let MaSo = donhang.MaSo;
                    let sql_text3 = "";
                    sps.map(function (e) {
                        sql_text3 += "INSERT INTO Lab4_DonHang_SanPham(MaSo,SanPhamID,SoLuong,ThanhTien) VALUES("+MaSo+","+e.ID+",1"+(e.Gia*1)+");";
                    })
            })
            db.query(sql_text3,function (err,rows) {
                if(err) res.send(err);
                else res.send("Tao don thanh cong");
            })
        }
    })
})