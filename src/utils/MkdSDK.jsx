export default function MkdSDK() {
  this._baseurl = "https://reacttask.mkdlabs.com";
  this._project_id = "reacttask";
  this._secret = "d9hedycyv6p7zw8xi34t9bmtsjsigy5t7";
  this._table = "";
  this._custom = "";
  this._method = "";

  const raw = this._project_id + ":" + this._secret;
  let base64Encode = btoa(raw);

  this.setTable = function (table) {
    this._table = table;
  };

  this.login = async function (email, password, role) {
    //TODO
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
    };

    const payload = {
      email: email,
      password: password,
      role: role,
    };

    const result = await fetch(this._baseurl + "/v2/api/lambda/login", {
      method: "post",
      headers: header,
      body: JSON.stringify(payload),
    });

    const jsonResult = await result.json();

    if (jsonResult.error) {
      throw new Error(jsonResult.message);
    } else {
      localStorage.setItem("token", jsonResult.token);
      localStorage.setItem("role", jsonResult.role);
      localStorage.setItem(
        "expire_at",
        Date.now() / 1000 + jsonResult.expire_at
      );
      return jsonResult;
    }
  };

  this.isTokenExpired = function () {
    const expireAt = localStorage.getItem("expire_at");
    if (!expireAt) {
      return true;
    }
    const currentTime = Date.now() / 1000; // Current time in seconds
    return currentTime > expireAt;
  };

  this.getHeader = function () {
    return {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "x-project": base64Encode,
    };
  };

  this.baseUrl = function () {
    return this._baseurl;
  };

  this.callRestAPI = async function (payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    switch (method) {
      case "GET":
        const getResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/GET`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonGet = await getResult.json();

        if (getResult.status === 401) {
          throw new Error(jsonGet.message);
        }

        if (getResult.status === 403) {
          throw new Error(jsonGet.message);
        }
        return jsonGet;

      case "PAGINATE":
        if (!payload.page) {
          payload.page = 1;
        }
        if (!payload.limit) {
          payload.limit = 10;
        }
        const paginateResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonPaginate = await paginateResult.json();

        if (paginateResult.status === 401) {
          throw new Error(jsonPaginate.message);
        }

        if (paginateResult.status === 403) {
          throw new Error(jsonPaginate.message);
        }
        return jsonPaginate;
      default:
        break;
    }
  };

  this.check = async function (role) {
    //TODO
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    let returnValue;
    try {
      const result = await fetch(this._baseurl + "/v2/api/lambda/check", {
        method: "post",
        headers: header,
        body: JSON.stringify({ role: role }),
      });
      const jsonResult = await result.json();
      if (jsonResult.error) {
        throw new Error(jsonResult.message);
      }
      returnValue = jsonResult;
    } catch (err) {
      throw new Error(err.message);
    }
    return returnValue;
  };
  return this;
}
