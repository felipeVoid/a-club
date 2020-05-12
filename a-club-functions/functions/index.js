'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors')({origin: true});
const app = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://a-club-admin.firebaseio.com'
});

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
};

const db = admin.database();
const dbFun = functions.database;
const adminUid = 'HHC4o74WxucfArmrFpwKeWN7SO13';

app.use(cors);
app.use(validateFirebaseIdToken);
app.get('/hello', (req, res) => {
  let dateNow = formatDate(new Date(Date.now()));
  let ref = db.ref('registered_users');

  const userIn = {
    status: 'default',
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    last_date: dateNow,
    sync: 'sync_off'
  }

  ref.child(req.user.uid).set(userIn)
  .then(() => {
    ref.once('value', regSnap => {
      const registered_users_snap = regSnap.val();
      if (registered_users_snap) {
        const refUsers = db.ref('users');
        refUsers.once('value', usersSnap => {
          const users_snap = usersSnap.val();
          if (users_snap) {
            if (!users_snap[req.user.uid]) {
              Object.keys(registered_users_snap).filter(key => {
                if (key != req.user.uid) {
                  refUsers.child(key + '/registered_users/' + req.user.uid).set(userIn)
                  .then(() => {
                    console.log('New user in OK [' + req.user.uid + '] => registered_users');
                  })
                  .catch(errorSetRegUsersIn => {
                    console.log('Update Error [' + user + '] => registered_users');
                    res.status(403).json({error: errorSetRegUsersIn});
                  });
                } else {
                  refUsers.child(key + '/registered_users').set(registered_users_snap)
                  .then(() => {
                    console.log('NEW! OK [' + req.user.uid + '] => registered_users');
                  })
                  .catch(errorSetRegUsersIn => {
                    console.log('Update Error [' + user + '] => registered_users');
                    res.status(403).json({error: errorSetRegUsersIn});
                  });
                }
              });
            }
          }
        });        
      }
    }, errorReg => {
      console.log(errorReg);
      res.status(403).json({error: errorReg});
    });
  }).catch(errorSetRegUsers => {
    console.log(errorSetRegUsers);
    res.status(403).json({error: errorSetRegUsers});
  });

  res.status(200).json({text: 'Welcome ' + req.user.name, user: userIn});
});

const refUserRegisteredSync = dbFun.ref('users/{userUid}/registered_users/{registerUid}/sync');
exports.syncDataTriggerByUser = refUserRegisteredSync.onWrite((snap, context) => {
  let dateNow = formatDate(new Date(Date.now()));
  if (snap.after.exists()) {
    if (context.authType === 'USER') {
      const register_uid = context.params.registerUid;       

      const refUserRegistered = db.ref('users/' + context.auth.uid + '/registered_users/' + register_uid);
      refUserRegistered.once('value', snapRegister => {
        if (snapRegister.val()) {
          const user = {
            value: snapRegister.val(),
            key: register_uid
          };

          const refAceptedList = db.ref('users/' + user.key + '/acepted_list');
          refAceptedList.once('value', okSnap => {
            let aceptedUsers = [];
            if (okSnap.val()) {
              aceptedUsers = okSnap.val();
              aceptedUsers.filter(x => {
                if (x == context.auth.uid) {
                  user.value['sync'] = 'sync_ok';
                }
              });           
            }

            if (adminUid == context.auth.uid) {
              user.value['sync'] = 'sync_ok';
            }

            switch(user.value['sync']) {
              case 'sync_off':
                break;
              case 'sync_await':
                const refWaitingList = db.ref('users/' + user.key + '/waiting_list');
                refWaitingList.once('value', awaitSnap => {
                  let waitingUsers = [];
                  if (awaitSnap.val()) {
                    waitingUsers = awaitSnap.val();                
                  }
                  if (waitingUsers.indexOf(context.auth.uid) == -1) {
                    waitingUsers.push(context.auth.uid);
                    refWaitingList.set(waitingUsers);
                  }
                  refUserRegistered.child('sync').set('sync_off');
                }).catch(errorSyncAwait => {
                  refUserRegistered.child('sync').set('sync_off');
                  console.log(errorSyncAwait);
                  return false;
                });
                break;
              case 'sync_ok':
                const refSyncNodeNotes = db.ref('users/' + user.key + '/node');
                refSyncNodeNotes.once('value', nodeNotesSnap => {
                  if (nodeNotesSnap.val()) {
                    refUserRegistered.child('node').set(nodeNotesSnap.val());
                    refUserRegistered.child('modified_date').set(dateNow);

                    console.log('Sync OK [' + context.auth.uid + '] => ' + user.key);

                    if (adminUid != context.auth.uid) {
                      sendSyncOkNotificationByUid(user.key, user);
                    }
                    sendSyncOkNotificationByUid(context.auth.uid, user);
                  }

                  refUserRegistered.child('sync').set('sync_off');
                }).catch(errorSyncOk => {                  
                  refUserRegistered.child('sync').set('sync_off');

                  console.log('Sync ERROR[' + context.auth.uid + '] => ' + user.key);
                  console.log(errorSyncOk);
                  return false;
                });
                break;
              }
          });
        } else {
          console.log('Out :(');
        }
      });
    }
  }

  return true;
});


// Sync NodeNotes ALL
/*
const refUserRegistered = dbFun.ref('users/{userUid}/registered_users');
exports.syncDataTriggerAll = refUserRegistered.onWrite((snap, context) => {
  let dateNow = formatDate(new Date(Date.now()));
  if (!snap.before.exists()) {
    console.log('Data do not exist');
    return null;
  }

  if (snap.after.exists()) {
    if (context.authType === 'USER') {
      console.log('Sync Start[' + context.auth.uid + ']');
      try {
        let regUsers = snap.after.val();
        for (const user in regUsers) {
          if (user) {
            const refAceptedList = db.ref('users/' + user + '/acepted_list');
            refAceptedList.once('value', okSnap => {
              let aceptedUsers = [];
              if (okSnap.val()) {
                aceptedUsers = okSnap.val();
                aceptedUsers.filter(x => {
                  if (x == context.auth.uid) {
                    regUsers[user]['sync'] = 'sync_ok';
                  }
                });           
              }

              if (adminUid == context.auth.uid) {
                regUsers[user]['sync'] = 'sync_ok';
              }

              const refRegUser = db.ref('users/' + context.auth.uid + '/registered_users/' + user);

              switch(regUsers[user]['sync']) {
                case 'sync_off':
                  break;
                case 'sync_await':
                  const refWaitingList = db.ref('users/' + user + '/waiting_list');
                  refWaitingList.once('value', awaitSnap => {
                    let waitingUsers = [];
                    if (awaitSnap.val()) {
                      waitingUsers = awaitSnap.val();                
                    }
                    if (waitingUsers.indexOf(context.auth.uid) == -1) {
                      waitingUsers.push(context.auth.uid);
                      refWaitingList.set(waitingUsers);
                    }
                    refRegUser.child('sync').set('sync_off');
                  }).catch(errorSyncAwait => {
                    refRegUser.child('sync').set('sync_off');
                    console.log(errorSyncAwait);
                    return false;
                  });
                  break;
                case 'sync_ok':
                  const refSyncNodeNotes = db.ref('users/' + user + '/node');
                  refSyncNodeNotes.once('value', nodeNotesSnap => {
                    if (nodeNotesSnap.val()) {
                      refRegUser.child('node').set(nodeNotesSnap.val());
                      refRegUser.child('modified_date').set(dateNow);
                      console.log('Sync OK[' + context.auth.uid + '] => ' + user);
                    }
                    refRegUser.child('sync').set('sync_off');
                  }).catch(errorSyncOk => {
                    console.log('Sync ERROR[' + context.auth.uid + '] => ' + user);
                    refRegUser.child('sync').set('sync_off');
                    console.log(errorSyncOk);
                    return false;
                  });
                  break;
                }
              }).catch(errorSync => {
                console.log(errorSync);
                return false;
              });
          }
        }
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
  return true;
});
*/

function formatDate(date) {
  let dd = String(date.getDate()).padStart(2, '0');
  let MM = String(date.getMonth() + 1).padStart(2, '0');
  let yy = date.getFullYear();
  let mm = String(date.getMinutes()).padStart(2, '0');

  date.setHours(date.getHours() - 4); // -4 to diff time zone
  let hh = date.getHours();

  return dd + '/' + MM + '/' + yy + ', ' + hh + ':' + mm;
}

function sendSyncOkNotificationByUid(uid, user) {
  const text = 'User now can read [ ' + user.value.email + ' ] NodeNotes';
  const name = 'Sync OK';
  const extra = user;
  const icon = 'sync';
  sendNotification(uid, name, text, icon, extra);
}

function sendNotification(uid, nameIn, textIn, iconIn, extraIn) {
  let dateNow = formatDate(new Date(Date.now()));
  const refNotifications = db.ref('users/' + uid + '/notifications');
  refNotifications.once('value', not => {
    let notVal = [];
    if (not.val()) {
      notVal = not.val();
    }

    const not_send_obj = {      
      name: nameIn,
      text: textIn,
      icon: iconIn,
      extra: extraIn,
      date: dateNow,
      read: false
    };

    notVal.push(not_send_obj);
    refNotifications.set(notVal);
  });
}

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.app = functions.https.onRequest(app);