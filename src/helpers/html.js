import _ from 'lodash';

function createHTMLTableRow(data, idx) {
  return `
  <tr>
      <td>${idx}.</td>
      <td>
        <a href="vscode://file${data.file}">${data.fileName}</a>
      </td>
      <td>${data.atomicClassesCount}</td>
      <td>${data.classesTransformedCount}</td>
      <td>${
        data.atomicClassesCount &&
        (
          (data.classesTransformedCount / data.atomicClassesCount) *
          100
        ).toFixed(2)
      }%</td>
  </tr>`;
}

function createTableRow(data) {
  return `
  <tr>
      <td>${data.from}</td>
      <td>${data.to}</td>
      <td>${data.count || 0}</td>
      <td>${data.plugin || ''}</td>
  </tr>`;
}

function generateHTMLReport(
  transformReport,
  totalAtomicClasses,
  totalTransformedClasses
) {
  const changeList = transformReport
    .filter((v) => v.atomicClassesCount > 0 && v.classesTransformedCount > 0)
    .map((value) => {
      return `
      <div class="change-set"> 
      <h3>
        <a href="vscode://file${value.file}">${value.fileName}</a>
      </h3>
      <div class="file-stat" >
        <p>Atomic classes found: ${value.atomicClassesCount}</p>
        <p>Classes transformed: ${value.classesTransformedCount}</p>
        <p>Percentage: ${(
          (value.classesTransformedCount / value.atomicClassesCount) *
          100
        ).toFixed(2)}%</p>
      </div>
      <h4>Transformed classes:</h4>
      <table class="changes-table">
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Count</th>
          <th>Plugin</th>
        </tr>
        ${_.uniqBy(value.transformedClasses, 'from')
          .map(createTableRow)
          .join('')}
      </table>
      ${
        value.notTransformedClasses.length > 0
          ? `
      
      <h4>Not transformed classes:</h4>
      <table class="changes-table">
        ${_.uniq(value.notTransformedClasses).join(', ')}
      </table>`
          : ''
      }
      </div>
  `;
    });

  const classesNotTransformedList = _.uniq(
    transformReport
      .reduce((acc, value) => {
        return [...acc, ...value.notTransformedClasses];
      }, [])
      .map((v) => `<li>${v}</li>`)
  ).join('');

  const html = `
  <html>
  <head>
    <title>Transform report</title>
  </head>
  <style>
    body {
      padding: 16px;
    }

    * {
      font-family: monospace;
    }
    
    table {
      width: 100%;
    }

    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      text-align: left;
    }

    td, th {
      padding: 8px 16px;
    }

    .change-list {
      margin-top: 1rem;
    }

    .change-set {
      margin: 0rem 0rem 1rem 0rem;
      border: 1px solid black;
      padding: 0 1rem 1rem 1rem;
      border-radius: 10px;
    }

    .file-stat {
      display: flex;
      background-color: aliceblue;
    }

    .file-stat p {
      margin: 0;
      border: 1px solid black;
      flex: 1;
      padding: 0.5rem;
    }

    .changes-table {
      width: fit-content
    }
  </style>
  <h2>Transform report</h2>
  <h3>Files transformed: ${transformReport.length}</h3>
    <h3>Total atomic classes found: ${totalAtomicClasses}</h3>
    <h3>Total classes transformed: ${totalTransformedClasses}</h3>
    <h3>Total percentage: ${(
      (totalTransformedClasses / totalAtomicClasses) *
      100
    ).toFixed(2)}%</h3>
   
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>File</th>
        <th>Atomic classes found</th>
        <th>Classes transformed</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${transformReport
        .filter((v) => v.atomicClassesCount > 0)
        .map(createHTMLTableRow)
        .join('')}
    </tbody>
  </table>
  <h3>Classes not transformed:</h3>
  <ul>
    ${classesNotTransformedList}
  </ul>
  <div class="change-list">
    ${changeList}
  </div>
  `;

  return html;
}

export default generateHTMLReport;
