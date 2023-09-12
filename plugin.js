export default [
  {
    name: 'Transition',
    plugin: function (className, mappings) {
      const regex = /Trs\(.*\)/;
      const matched = className.match(regex);
      if (matched) {
        return 'transofrm';
      }
      return null;
    },
  },
];
