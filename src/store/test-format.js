// 测试代码 - 可以单独运行
function testFormatting() {
    // 测试get命令
    console.log('=== GET命令格式示例 ===');
    
    // 单个键
    const singleKey = 'exciter.dpdInputFreq';
    const getSingleMessage = {
      command: 'get',
      key: [singleKey]
    };
    console.log(JSON.stringify(getSingleMessage));
    
    // 多个键
    const multipleKeys = ['exciter.dpdInputFreq', 'exciter.dpdFreqSametoRf', 'system.systemStatus'];
    const getMultipleMessage = {
      command: 'get',
      key: multipleKeys
    };
    console.log(JSON.stringify(getMultipleMessage));
    
    // 测试set命令
    console.log('\n=== SET命令格式示例 ===');
    
    // 布尔值
    const booleanValue = { 'exciter.dpdFreqSametoRf': false };
    const setBooleanMessage = {
      command: 'set',
      key: booleanValue
    };
    console.log(JSON.stringify(setBooleanMessage));
    
    // 数字值
    const numberValue = { 'exciter.rfOutputPower': -8.4 };
    const setNumberMessage = {
      command: 'set',
      key: numberValue
    };
    console.log(JSON.stringify(setNumberMessage));
    
    // 字符串值
    const stringValue = { 'exciter.rfOutputFreq': '14.000' };
    const setStringMessage = {
      command: 'set',
      key: stringValue
    };
    console.log(JSON.stringify(setStringMessage));
    
    // 多个值
    const multipleValues = {
      'exciter.rfOutputPower': -8.4,
      'exciter.rfPMEnable': true,
      'exciter.rfOutputFreq': '14.000',
      'exciter.rfOutputEnable': true,
      'exciter.rfAMEnable': false
    };
    const setMultipleMessage = {
      command: 'set',
      key: multipleValues
    };
    console.log(JSON.stringify(setMultipleMessage));
  }
  
  // 运行测试
  testFormatting();