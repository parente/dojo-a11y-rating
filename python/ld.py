#!/usr/bin/python
'''
Toying with Levenshtein Distance. Quick and dirty impl.

Copyright (c) Peter Parente 2011. All Rights Reserved.
Licensed under the WTFPL. http://sam.zoy.org/wtfpl/
'''

def permute(s, ops, t=None):
    '''Permute string s with ops and assert it matches t.'''
    for op in ops:
        if op is None:
            continue
        elif op.ty == 'insert':
            s = s[:op.pos] + op.ch + s[op.pos:]
        elif op.ty == 'update':
            s = s[:op.pos] + op.ch + s[op.pos+1:]
        elif op.ty == 'delete':
            s = s[:op.pos] + s[op.pos+1:]
    if t is not None: assert(s == t)
    return s

class Op(object):
    '''A single edit op.'''
    def __init__(self, ty, ch, pos):
        self.ty = ty
        self.ch = ch
        self.pos = pos
        # treat update cost as 2 (del + ins)
        self.cost = 2 if ty == 'update' else 1
        
    def __repr__(self):
        return str(self.ty[0]) if self.ty is not None else 'n'

class Cell(object):
    '''A cell in the table.'''
    def __init__(self, op, prev):
        if prev is None:
            self.length = 0
        else:
            self.length = prev.length + op.cost
        self.op = op
        self.prev = prev
        
    def __repr__(self):
        return str(self.length) + str(self.op)
    
    def get_ops(self):
        ops = []
        node = self
        while(node.prev is not None):
            if node.op.ty is not None: ops.append(node.op)
            node = node.prev
        ops.reverse()
        return ops

def ld(a, b):
    if not a:
        return [Op('insert', b[i], i) for i in xrange(len(b))]
    elif not b:
        return [Op('delete', None, 0) for i in xrange(len(a))]
 
    # top-left
    row_p = [Cell(None, None)]
    
    # seed first row, all inserts
    for x in xrange(0, len(b)):
        op = Op('insert', b[x], x)
        cell = Cell(op, row_p[x])
        row_p.append(cell)

    #print row_p

    for y, ca in enumerate(a):
        # first column, all deletes
        op = Op('delete', None, 0)
        row_c = [Cell(op, row_p[0])]
        
        for x, cb in enumerate(b):
            cell_o = row_p[x+1]
            m = cell_o.length
            ty = 'delete'
            pos = x + 1
            ch = None
            if row_c[x].length < m:
                cell_o = row_c[x]
                m = cell_o.length
                ty = 'insert'
                pos = x
                ch = cb
            if row_p[x].length < m:
                cell_o = row_p[x]
                ty = 'update' if (ca != cb) else None
                pos = x
                ch = cb
            op = Op(ty, ch, pos)
            row_c.append(Cell(op, cell_o))

        #print row_c
        row_p = row_c
    
    return row_p[-1].get_ops()

if __name__ == '__main__':
    tests = [
        ('abcdefghijklmnopqrstuvwxyz', 'abcdfghijk123lmpqrstuvwxyz'),
        ('a b', 'x cb'),
        ('a b', 'ax b'),
        ('aacc', 'aabbbcc'),
        ('Sunday', 'Saturday'),
        ('aabbbcc', 'aacc'),
        ('aabc', 'xaab'),
        ('abc', 'xab'),
        ('abc', ''),
        ('', 'abc')
    ]
    for a, b in tests:        
        print a, '->', b
        ops = ld(a, b)
        for op in ops:
            print op.ty, op.ch, op.pos
        print permute(a, ops, b)
        print