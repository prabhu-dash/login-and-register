const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const db = mysql.createConnection({
    host: process.env.dbs_host,
    user: process.env.dbs_user,
    password: process.env.dbs_password,
    database: process.env.dbs
});

exports.login = async (req, res) => {
  try {
    const { registration, password } = req.body;

    if( !registration || !password ) {
        return res.status(400).render('index', {
            message: 'Please provide registration number and password'
        });
    }

    db.query('SELECT * FROM userspectrum WHERE registration = ?', [registration], async (error, results) => {
        console.log(results);

        if(!results || !(await bcrypt.compare(password, results[0].password) ) )
        res.status(401).render('index', {
            message: 'Password is incorrect'
        })
        else {
            const id = results[0].id;
            
            const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            })

            console.log(" The token is:" + token);

            const cookieOptions = {
                expires: newDate(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            }

            res.Cookie('jwt', token, cookieOptions );
            res.status(200).redirect("index")

        }

    });
  } catch (error) {
      console.log(error);
  }
}

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, contact, branch, registration, password, cpassword, domain} = req.body;

    db.query('SELECT Registration FROM userspectrum WHERE Registration = ?', [registration], async (error, results) => {
        if(error)
        {
            console.log(error);
        }
        
        if(results.length > 0)
        {
            return res.render('register', {
                message: 'That registration is used'
            });
        }

        else if (password != cpassword)
        {
            return res.render('register', {
                message: 'Password do not match'
            });
            
        }

        let hashed = await bcrypt.hash(password, 6);
        console.log(hashed);

        db.query('INSERT INTO userspectrum SET ? ', {Name: name,Email: email,Contact: contact,Branch: branch,Registration: registration,Password: hashed,Domain: domain}, (error, result) => {
            if(error)
            {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'You are registered'
                });
            }
        });

    });

    
}