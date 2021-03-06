var sqlite3 = require('..');
var assert = require('assert');

describe('interrupt', function() {
    it('should interrupt queries', function(done) {
        var query =
            'with t (n) as (values (1),(2),(3),(4),(5),(6),(7),(8)) ' +
            'select last.n ' +
            'from t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t as last';

        var interrupted = false;
        var saved = null;

        var db = new sqlite3.Database(':memory:', function() {
            db.each(query, function(err) {
                if (!interrupted) {
                    interrupted = true;
                    db.interrupt();
                } else if (err) {
                    saved = err;
                }
            });

            db.close(function() {
                if (saved) {
                    assert.equal(saved.message, 'SQLITE_INTERRUPT: interrupted');
                    assert.equal(saved.errno, sqlite3.INTERRUPT);
                    assert.equal(saved.code, 'SQLITE_INTERRUPT');
                    done();
                } else {
                    done(new Error('Completed query without error, but expected error'));
                }
            });
        });
    });

    it('should throw if interrupt is called before open', function(done) {
        var db = new sqlite3.Database(':memory:');

        assert.throws(function() {
            db.interrupt();
        }, (/Database is not open/));

        db.close();
        done();
    });

    it('should throw if interrupt is called after close', function(done) {
        var db = new sqlite3.Database(':memory:');

        db.close(function() {
            assert.throws(function() {
                db.interrupt();
            }, (/Database is not open/));

            done();
        });
    });

    it('should throw if interrupt is called during close', function(done) {
        var db = new sqlite3.Database(':memory:', function() {
            db.close();
            assert.throws(function() {
                db.interrupt();
            }, (/Database is closing/));
            done();
        });
    });
});
