import { Request, Response } from "express";
import { select } from "../Services/registerService";
import { con } from "../config/config";
import { chekbox } from "../common";
import moment from "moment";
// import { RowDataPacket } from "mysql2";
import mysql, { QueryResult } from "mysql2/promise";

export const submitData = (req: Request, res: Response) => {
  var data = req.body;
  console.log(data);
  var education = [
    data.education1,
    data.education2,
    data.education3,
    data.education4,
  ];
  var company = [data.companyName1, data.companyName2, data.companyName3];
  var refrences = [data.person1, data.person2, data.person3];
  var language = [data.Language1, data.Language2, data.Language3];
  var ability = [data.ability1, data.ability2, data.ability3];
  var technology = [data.technology1, data.technology2, data.technology3];
  var level = [data.level1, data.level2, data.level3];
  var prefrences = [
    data.location,
    data.department,
    data.noticePerid,
    data.currentCtc,
    data.expectedCtc,
  ];

  const queryPromise1 = async () => {
    var sql = `insert into BasicDetails (name, lastName, designation, email, city, state, contactNo, gender, birthday, relationshipStatus, zipcode,address1,address2) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var basic = [
      data.name[0],
      data.lastName[0],
      data.designation[0],
      data.email[0],
      data.city[0],
      data.state[0],
      data.contactNo[0],
      data.gender[0],
      data.birthday[0],
      data.relationshipStatus[0],
      data.zipcode[0],
      data.address1[0],
      data.address2[0],
    ];
    try {
      const [result] = await con.query(sql, basic);
      const insertId = (result as mysql.ResultSetHeader).insertId;
      return insertId;
    } catch (error) {
      console.log("error in executing query", error);
    }
  };
  const queryPromise2 = (insertid: number | undefined) => {
    education.forEach((ele) => {
      if (ele[0] != "") {
        var sql = `insert into School(fkEmp, board, passingYear, percentage) values (${insertid},'${ele[0]}','${ele[1]}',${ele[2]});`;
        con
          .query(sql)
          .then(() => {
            console.log("education data inserted");
          })
          .catch((error) => {
            throw error;
          });
      }
    });
  };
  const queryPromise3 = (insertid: number | undefined) => {
    company.forEach((ele) => {
      if (ele[0] != "") {
        var sql = `insert into WorkExperience(fkEmp, companyName, designation, fromDate, toDate) values (${insertid},'${ele[0]}','${ele[1]}','${ele[2]}','${ele[3]}')`;
        con
          .query(sql)
          .then(() => {
            console.log("Work experinece inserted");
          })
          .catch((error) => {
            throw error;
          });
      }
    });
  };
  const queryPromise4 = (insertid: number | undefined) => {
    var lang = chekbox(language, ability);
    try {
      for (let i = 0; i < lang.length; i++) {
        con.query(
          `insert into Language(empid, name, reading, writing, speaking) values (${insertid},?,?,?,?);`,
          [lang[i][0], lang[i][1], lang[i][2], lang[i][3]]
        );
      }
      console.log("language data inserted");
    } catch (error) {
      console.log("error in executing language data", error);
    }
  };
  const queryPromise5 = (insertid: number | undefined) => {
    let i = 0;
    technology.forEach((ele) => {
      if (ele != undefined) {
        con
          .query(
            `insert into Technology (fkEmp, name, level) values (${insertid},'${ele[0]}','${level[i]}')`
          )
          .then(() => {
            console.log("tecnology data inserted");
          })
          .catch((error) => {
            throw error;
          });
      }
      i++;
    });
  };
  const queryPromise6 = (insertid: number | undefined) => {
    refrences.forEach((ele) => {
      if (ele[0] != "") {
        try {
          con.query(
            `insert into RefrenceContact (fkEmp, person, contactNumber, relation) values (${insertid},?,?,?)`,
            [ele[0], ele[1], ele[2]]
          );
          console.log("inserted refrence contact");
        } catch (error) {
          console.log("problem in inseting refrences");
        }
      }
    });
  };
  const queryPromise7 = (insertid: number | undefined) => {
    var prefrences1 = prefrences.map((x) => (x == "" ? (x = null) : (x = x)));
    try {
      con.query(
        `insert into Prefrences (fkEmp, location, department, noticePeriod, currentCtc, expectedCtc) values (${insertid},?,?,?,?,?);`,
        [
          prefrences1[0],
          prefrences1[1],
          prefrences1[2],
          prefrences1[3],
          prefrences1[4],
        ]
      );
      console.log("inserted prefrences properly");
    } catch (error) {
      console.log("prefrences data not inserted", error);
    }
  };
  async function sequentialQueries() {
    try {
      var insertid = await queryPromise1();
      var edu = queryPromise2(insertid);
      var work = queryPromise3(insertid);
      var lang = queryPromise4(insertid);
      var tech = queryPromise5(insertid);
      var ref = queryPromise6(insertid);
      var pref = queryPromise7(insertid);
      // console.log(edu, work, lang, tech, ref, pref);
    } catch (error) {
      console.log(error);
    }
  }
  sequentialQueries();
};
export const getData = (req: Request, res: Response) => {
  var id = req.query.id;

  const basicDetail = async () => {
    var sql =
      "select  name, lastName, designation, email, city, state, contactNo, gender, birthday, relationshipStatus, zipcode,address1,address2 from BasicDetails where id =?;";
    try {
      const [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in getting basic details", error);
    }
  };
  const educationDetails = async () => {
    var sql =
      "select board, passingYear, percentage from School where fkEmp =?;";
    try {
      const [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in selecting education details", error);
    }
  };
  const workExperienceDetails = async () => {
    var sql =
      "select companyName, designation, fromDate, toDate from WorkExperience where fkEmp =?;";
    try {
      var [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in getting work experience ", error);
    }
  };
  const languageKnown = async () => {
    var sql =
      "select name, reading, writing, speaking from Language where empid =?;";
    try {
      var [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in getting language known");
    }
  };
  const technologyKnown = async () => {
    var sql = "select name, level from Technology where fkEmp =?;";

    try {
      var [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in getting technology known");
    }
  };
  const refrences = async () => {
    var sql =
      "select person, contactNumber, relation from RefrenceContact where fkEmp =?;";
    try {
      var [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in getting refrences", error);
    }
  };
  const prefrences = async () => {
    var sql =
      "select location, department, noticePeriod, currentCtc, expectedCtc from Prefrences where fkEmp =?;";
    try {
      var [result] = await con.query(sql, [id]);
      return result;
    } catch (error) {
      console.log("error in getting prefrences details", error);
    }
  };
  async function sequentialQueries() {
    try {
      var basicdetails = await basicDetail();
      var educationdetails = await educationDetails();
      var workexpdetails = await workExperienceDetails();
      var languageknown = await languageKnown();
      var technologknown = await technologyKnown();
      var refrencesdetails = await refrences();
      var prefrencesdetails = await prefrences();
      // console.log(basicdetails,educationdetails,workexpdetails,languageknown,technologknown,refrencesdetails,prefrencesdetails);

      // let date = moment(basicdetails[0][0].dob).utc().format("YYYY-MM-DD");
      if (basicdetails && prefrencesdetails !== undefined) {
        res.send({
          result: basicdetails,
          educationdetails: educationdetails,
          workexpdetails: workexpdetails,
          languageknown: languageknown,
          technologknown: technologknown,
          refrencesdetails: refrencesdetails,
          prefrencesdetails: prefrencesdetails,
          id: id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  sequentialQueries();
};

export const renderUpdate = (req: Request, res: Response) => {
  res.render("job_Application_Form.ejs");
};

export const updateData = (req: Request, res: Response) => {
  var data = req.body.data;
  // console.log(req.query);
  console.log(data);
  var basic = [
    data.name,
    data.lastName,
    data.designation,
    data.email,
    data.city,
    data.state,
    data.contactNo,
    data.gender,
    moment(data.birthday).utc().format("YYYY-MM-DD"),
    data.relationshipStatus,
    data.zipcode,
    req.body.id,
  ];
  console.log(basic);
  var education = [
    data.education1,
    data.education2,
    data.education3,
    data.education4,
  ];
  var company = [data.companyName1, data.companyName2, data.companyName3];
  var refrences = [data.person1, data.person2, data.person3];
  var language = [data.Language1, data.Language2, data.Language3];
  var ability = [data.ability1, data.ability2, data.ability3];
  var technology = [data.technology1, data.technology2, data.technology3];
  var level = [data.level1, data.level2, data.level3];
  var prefrences = [
    data.location,
    data.department,
    data.noticePerid,
    data.currentCtc,
    data.expectedCtc,
  ];
  const BasicDetails = async () => {
    var sql = `update BasicDetails set name=?, lastName=?, designation=?, email=?, city=?,state=?, contactNo=?, gender=?, birthday=?, relationshipStatus=?, zipcode=? where id = ?;`;
    try {
      await con.query(sql, basic);
      console.log("basic details updated");
    } catch (error) {
      console.log("error in updating basic details", error);
    }
  };

  const getId = async () => {
    var sql1 = `select id from School where fkEmp = ${req.body.id};
    select id from WorkExperience where fkEmp = ${req.body.id};
    select id from Language where empid = ${req.body.id};select id from Technology where fkEmp = ${req.body.id};
    select id from RefrenceContact where fkEmp = ${req.body.id};select id from Prefrences where fkEmp = ${req.body.id};`;
    try {
      var [result] = await con.query(sql1);

      return result;
    } catch (error) {
      console.log("could not get all the id's", error);
    }
  };

  async function sequentialQueries() {
    try {
      const basicdetails = await BasicDetails();
      interface ItemId {
        id: number;
      }
      const empid: Array<Array<ItemId>> = (await getId()) as Array<
        Array<ItemId>
      >;

      // console.log(empid);
      // console.log(empid[0][0].id);
      let i = 0;
      // update education data
      education.forEach(async (ele) => {
        if (ele[0] != "") {
          var temp = empid[0][i];
          if (temp == undefined) {
            var sql =
              "insert into School (fkEmp,board,passingYear,percentage) values(?,?,?,?)";
            var school = [req.body.id, ele[0], ele[1], ele[2]];
            try {
              await con.query(sql, school);
            } catch (error) {
              console.log("could not able to insert into school table", error);
            }
          } else {
            var sql = `update School set board = ?, passingYear = ?, percentage = ? where fkEmp = ? and id = ?;`;
            var school = [ele[0], ele[1], ele[2], req.body.id, empid[0][i].id];
            try {
              await con.query(sql, school);
            } catch (error) {
              console.log("could not update school data", error);
            }
          }
        }
        i++;
      });

      // update workexperinece data
      i = 0;
      company.forEach(async (ele) => {
        if (ele[0] != "") {
          if (empid[1][i] == undefined) {
            var sql =
              "insert into WorkExperience (fkEmp, companyName, designation, fromDate, toDate) values (?,?,?,?,?)";
            var from = moment(ele[2]).utc().format("YYYY-MM-DD");
            var to = moment(ele[2]).utc().format("YYYY-MM-DD");
            var company = [req.body.id, ele[0], ele[1], from, to];
            try {
              await con.query(sql, company);
            } catch (error) {
              console.log("could not insert company data", error);
            }
          } else {
            var sql = `update WorkExperience set companyName = ?, designation = ?, fromDate = ?, toDate = ? where fkEmp = ? and id = ?;`;
            var from = moment(ele[2]).utc().format("YYYY-MM-DD");
            var to = moment(ele[2]).utc().format("YYYY-MM-DD");
            var company = [
              ele[0],
              ele[1],
              from,
              to,
              req.body.id,
              empid[1][i].id,
            ];
            try {
              await con.query(sql, company);
            } catch (error) {
              console.log("could not update work experience", error);
            }
          }
        }

        i++;
      });

      // update language data to the database
      var lang = chekbox(language, ability);

      for (let i = 0; i < lang.length; i++) {
        if (empid[2][i] != undefined) {
          try {
            await con.query(
              `update  Language set name = ?, reading = ?, writing = ?, speaking =? where empid = ? and id = ?;`,
              [
                lang[i][0],
                lang[i][1],
                lang[i][2],
                lang[i][3],
                req.body.id,
                empid[2][i].id,
              ]
            );
            console.log("language data updates successfully");
          } catch (error) {
            console.log("could not update language data", error);
          }
        } else {
          try {
            await con.query(
              `insert into  Language (empid, name, reading, writing, speaking) values(?,?,?,?,?)`,
              [req.body.id, lang[i][0], lang[i][1], lang[i][2], lang[i][3]]
            );
          } catch (error) {
            console.log("could not update language data", error);
          }
        }
      }

      // updating technology data
      i = 0;
      technology.forEach(async (ele) => {
        if (ele != undefined) {
          if (empid[3][i] != undefined) {
            try {
              await con.query(
                `update Technology set name = ?, level =? where fkEmp = ? and id = ?;`,
                [ele, level[i], req.body.id, empid[3][i].id]
              );
            } catch (error) {
              console.log("cloud not update technology data", error);
            }
          } else {
            try {
              await con.query(
                `insert into Technology (fkEmp, name, level) values(?,?,?);`,
                [req.body.id, ele, level[i]]
              );
            } catch (error) {
              console.log("could not update technology data", error);
            }
          }
        }
        i++;
      });

      // updating refrences contact data
      i = 0;
      refrences.forEach(async (ele) => {
        if (ele[0] != "") {
          if (empid[4][i] != null) {
            try {
              await con.query(
                `update  RefrenceContact set  person = ?, contactNumber =?, relation =? where fkEmp = ? and id = ?;`,
                [ele[0], ele[1], ele[2], req.body.id, empid[4][i].id]
              );
            } catch (error) {
              console.log("could not update refrence data", error);
            }
          } else {
            try {
              await con.query(
                `insert into   RefrenceContact (fkEmp, person, contactNumber, relation) values(?,?,?,?)`,
                [req.body.id, ele[0], ele[1], ele[2]]
              );
            } catch (error) {
              console.log("could not update refrence data", error);
            }
          }
        }
        i++;
      });

      // updating prefrences data
      var prefrences1 = prefrences.map((x) => (x == "" ? (x = null) : (x = x)));
      if (empid[5][0] != null) {
        try {
          con.query(
            `update  Prefrences  set  location = ?, department =?, noticePeriod =?, currentCtc =?, expectedCtc =? where fkEmp = ? and id = ?;`,
            [
              prefrences1[0],
              prefrences1[1],
              prefrences1[2],
              prefrences1[3],
              prefrences1[4],
              req.body.id,
              empid[5][0].id,
            ]
          );
        } catch (error) {
          console.log("could not update prefrences", error);
        }
      } else {
        try {
          await con.query(
            `insert into  Prefrences (fkEmp, location, department, noticePeriod, currentCtc, expectedCtc) values (?,?,?,?,?,?)`,
            [
              req.body.id,
              prefrences1[0],
              prefrences1[1],
              prefrences1[2],
              prefrences1[3],
              prefrences1[4],
            ]
          );
        } catch (error) {
          console.log("could not update prefrences", error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  sequentialQueries();
};

export const thanks = (req: Request, res: Response) => {
  res.send("thanks for your response");
};

export const listOfEmployees = async (req: Request, res: Response) => {
  var result = await select(
    "select id as Serial_No, name as Name, lastName as Last_Name, designation as Designation, email as Email, city as City, contactNo as Contact_Number, gender Gender, birthday as Date_Of_Birth, relationshipStatus as Relationship_Status, address1 as Permanent_Address from BasicDetails",
    []
  );
  // console.log(result);
  res.render("list_of_employee.ejs", { result: result });
};