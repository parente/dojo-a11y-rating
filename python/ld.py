'''
Toying with Levenshtein Distance. Quick and dirty impl.

Copyright (c) Peter Parente 2011. All Rights Reserved.
Licensed under the WTFPL. http://sam.zoy.org/wtfpl/
'''

class Cell(object):
    def __init__(self, size, cell=None, op=None):
        self.size = size
        self.ops = []
        if cell:
            self.ops.extend(cell.ops)
        if op:
            self.ops.append(op)

def table(d, m, n):
    '''Print the edit table for debug.'''
    for i in xrange(-1, m):
        for j in xrange(-1, n):
            print d.get((i,j), 0),
        print

def permute(s, ops, t=None):
    '''Permute string s with ops and assert it matches t.'''
    for op in ops:
        if op[0] == 'insert':
            s = s[:op[1]] + op[2] + s[op[1]:]
        elif op[0] == 'update':
            s = s[:op[1]] + op[2] + s[op[1]+1:]
        elif op[0] == 'delete':
            s = s[:op[1]] + s[op[1]+1:]
    if t is not None: assert(s == t)
    return s

def ld(s, t):
    if not len(s):
        # all t as inserts
        c = Cell(len(t))
        ops = [['insert', i, ch] for i, ch in enumerate(t)]
        c.ops = ops
        return c
    elif not len(t):
        # all deletes
        c = Cell(len(s))
        ops = [['delete', 0, None]] * len(s)
        c.ops = ops
        return c

    d = {(-1,-1) : Cell(0)}
    m = len(s)
    n = len(t)
    
    for i in xrange(m+1):
        d[(i,-1)] = Cell(i+1)
    for j in xrange(n+1):
        d[(-1,j)] = Cell(j+1)

    for j in xrange(n):
        for i in xrange(m):
            if s[i] == t[j]:
                d[(i,j)] = d[(i-1, j-1)] # noop
            else:
                cell = d[(i-1, j)] # delete
                ty = 'delete'
                pos = j + 1
                ch = None
                if d[(i, j-1)].size < cell.size:
                    cell = d[(i, j-1)] # insert
                    ty = 'insert'
                    pos = j
                    ch = t[j]
                if d[(i-1, j-1)].size < cell.size:
                    cell = d[(i-1, j-1)] # update
                    ty = 'update'
                    pos = j
                    ch = t[j]
                d[(i,j)] = Cell(cell.size+1, cell, [ty, pos, ch])

    # @debug: print the table
    #table(d, m, n)
    return d[(m-1,n-1)]

if __name__ == '__main__':
    # test case, alphabet 15 times
    a = 'abcdefghijklmnopqrstuvwxyz'*15
    # toss an edit somewhere in the middle
    b = a[:100] + '12345' + a[107:] + '678'
    # compute ld
    cell = ld(a, b)
    # apply edits to a and make sure it now matches b
    permute(a, cell.ops, b)

    print 'Initial string length:', len(a)
    print 'New string length:', len(b)
    print 'Edit distance:', cell.size
    print 'Ops:', cell.ops